import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiTruck, FiStar, FiNavigation } from 'react-icons/fi';

// Fix des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour centrer la carte sur les marqueurs
function MapBounds({ concessions }) {
    const map = useMap();

    useEffect(() => {
        if (concessions.length > 0) {
            const bounds = concessions
                .filter(c => c.latitude && c.longitude)
                .map(c => [c.latitude, c.longitude]);

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [concessions, map]);

    return null;
}

export default function ConcessionsMapView({ concessions, selectedConcession, onSelectConcession }) {
    const navigate = useNavigate();
    const [mapCenter] = useState([14.6928, -17.4467]); // Dakar par défaut
    const [mapZoom] = useState(12);

    // Filtrer les concessions avec coordonnées valides
    const validConcessions = concessions.filter(
        c => c.latitude && c.longitude && !isNaN(c.latitude) && !isNaN(c.longitude)
    );

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête */}
            <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <FiMapPin className="text-xl" />
                    <h3 className="font-semibold">Carte des concessions</h3>
                </div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    {validConcessions.length} concession{validConcessions.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Carte */}
            <div className="h-[500px] relative">
                {validConcessions.length > 0 ? (
                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Ajuster la vue aux marqueurs */}
                        <MapBounds concessions={validConcessions} />

                        {/* Marqueurs des concessions */}
                        {validConcessions.map((concession) => (
                            <Marker
                                key={concession.id}
                                position={[concession.latitude, concession.longitude]}
                                eventHandlers={{
                                    click: () => {
                                        onSelectConcession && onSelectConcession(concession);
                                    },
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[250px]">
                                        {/* Logo */}
                                        {concession.logo && (
                                            <div className="mb-3">
                                                <img
                                                    src={concession.logo}
                                                    alt={concession.nom_entreprise}
                                                    className="h-12 w-auto object-contain"
                                                />
                                            </div>
                                        )}

                                        {/* Nom */}
                                        <h4 className="font-bold text-gray-900 mb-2 text-lg">
                                            {concession.nom_entreprise}
                                        </h4>

                                        {/* Note */}
                                        {concession.note_moyenne && (
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="flex items-center space-x-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            className={`text-xs ${i < Math.floor(concession.note_moyenne)
                                                                    ? 'text-yellow-400 fill-yellow-400'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {concession.note_moyenne.toFixed(1)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({concession.nombre_avis || 0})
                                                </span>
                                            </div>
                                        )}

                                        {/* Véhicules */}
                                        <div className="flex items-center space-x-2 mb-2 text-gray-600">
                                            <FiTruck className="text-teal-600" />
                                            <span className="text-sm">
                                                {concession.nombre_vehicules || 0} véhicules
                                            </span>
                                        </div>

                                        {/* Adresse */}
                                        <p className="text-sm text-gray-600 mb-3 flex items-start space-x-1">
                                            <FiMapPin className="mt-1 flex-shrink-0 text-gray-400" />
                                            <span className="line-clamp-2">
                                                {concession.adresse}
                                                {concession.ville && `, ${concession.ville}`}
                                            </span>
                                        </p>

                                        {/* Boutons */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/concessions/${concession.id}`)}
                                                className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded transition-colors"
                                            >
                                                Voir détails
                                            </button>

                                            {concession.latitude && concession.longitude && (
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${concession.latitude},${concession.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center justify-center"
                                                    title="Itinéraire"
                                                >
                                                    <FiNavigation className="text-lg" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <FiMapPin className="mx-auto text-5xl text-gray-400 mb-3" />
                            <p className="text-gray-600">Aucune concession avec localisation disponible</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Légende */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>💡 Cliquez sur un marqueur pour voir les détails</span>
                    <span className="text-teal-600 font-medium">
                        {validConcessions.length} localisation{validConcessions.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
}