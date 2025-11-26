import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FiMapPin, FiClock, FiPhone, FiMail } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet avec Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function VehiculeLocationMap({ concession }) {
    if (!concession) {
        return null;
    }

    // Position par défaut (Dakar, Sénégal)
    const defaultPosition = [14.6928, -17.4467];

    // Récupérer la position de la concession
    const position =
        concession.latitude && concession.longitude
            ? [parseFloat(concession.latitude), parseFloat(concession.longitude)]
            : defaultPosition;

    // URL pour ouvrir dans OpenStreetMap
    const mapsUrl = concession.latitude && concession.longitude
        ? `https://www.openstreetmap.org/?mlat=${concession.latitude}&mlon=${concession.longitude}#map=15/${concession.latitude}/${concession.longitude}`
        : `https://www.openstreetmap.org/search?query=${encodeURIComponent(
            concession.adresse || concession.ville
        )}`;

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Emplacement du concessionnaire
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Informations */}
                    <div className="space-y-6">
                        {/* Nom de la concession */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {concession.nom}
                            </h3>
                            {concession.description && (
                                <p className="text-gray-600 text-sm">{concession.description}</p>
                            )}
                        </div>

                        {/* Adresse */}
                        <div className="flex items-start space-x-3">
                            <FiMapPin className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                            <div>
                                <div className="font-medium text-gray-900 mb-1">Adresse</div>
                                <div className="text-gray-600">
                                    {concession.adresse}
                                    <br />
                                    {concession.ville}, {concession.region}
                                    {concession.code_postal && (
                                        <>
                                            <br />
                                            {concession.code_postal}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Horaires */}
                        {concession.horaires && (
                            <div className="flex items-start space-x-3">
                                <FiClock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <div className="font-medium text-gray-900 mb-1">
                                        Horaires d'ouverture
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                        {concession.horaires}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        <div className="space-y-2">
                            {concession.telephone && (
                                <div className="flex items-center space-x-3">
                                    <FiPhone className="text-blue-600 flex-shrink-0" size={18} />

                                    <a href={`tel:${concession.telephone}`}
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        {concession.telephone}
                                    </a>
                                </div>
                            )}

                            {concession.email && (
                                <div className="flex items-center space-x-3">
                                    <FiMail className="text-blue-600 flex-shrink-0" size={18} />

                                    <a href={`mailto:${concession.email}`}
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        {concession.email}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Bouton direction */}

                        <a href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <FiMapPin />
                            <span>Obtenir l'itinéraire</span>
                        </a>
                    </div>

                    {/* Carte OpenStreetMap */}
                    <div className="h-[400px] bg-gray-200 rounded-xl overflow-hidden">
                        {concession.latitude && concession.longitude ? (
                            <MapContainer
                                center={position}
                                zoom={15}
                                scrollWheelZoom={false}
                                className="w-full h-full"
                            >
                                {/* Tuiles OpenStreetMap */}
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {/* Marqueur de la concession */}
                                <Marker position={position}>
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-900 mb-1">
                                                {concession.nom}
                                            </p>
                                            <p className="text-gray-600 text-xs">
                                                {concession.adresse}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {concession.ville}, {concession.region}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <FiMapPin size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>Carte non disponible</p>

                                    <a href={mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                                    >
                                        Ouvrir dans OpenStreetMap
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            </div >
        </div >
    );
}