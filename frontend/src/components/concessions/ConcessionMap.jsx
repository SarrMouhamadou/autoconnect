import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

// Fix pour les icônes Leaflet avec Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ConcessionMap({
    latitude = 14.6928,
    longitude = -17.4467,
    concessionName = "Concession",
    address = "",
    telephone = "",
    email = ""
}) {
    const position = [latitude, longitude];
    const zoom = 15;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête */}
            <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <div className="flex items-center space-x-2">
                    <FiMapPin className="text-xl" />
                    <h3 className="font-semibold">Localisation</h3>
                </div>
            </div>

            {/* Carte Leaflet */}
            <div className="h-80">
                <MapContainer
                    center={position}
                    zoom={zoom}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            <div className="p-2">
                                <h4 className="font-bold text-gray-900 mb-2">{concessionName}</h4>
                                {address && (
                                    <p className="text-sm text-gray-600 mb-2 flex items-start space-x-1">
                                        <FiMapPin className="mt-1 flex-shrink-0" />
                                        <span>{address}</span>
                                    </p>
                                )}
                                {telephone && (
                                    <p className="text-sm text-gray-600 mb-1 flex items-center space-x-1">
                                        <FiPhone className="flex-shrink-0" />
                                        <span>{telephone}</span>
                                    </p>
                                )}
                                {email && (
                                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                                        <FiMail className="flex-shrink-0" />
                                        <span>{email}</span>
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>

            {/* Adresse en bas */}
            {address && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <FiMapPin className="mt-1 flex-shrink-0 text-teal-600" />
                        <p>{address}</p>
                    </div>
                </div>
            )}
        </div>
    );
}