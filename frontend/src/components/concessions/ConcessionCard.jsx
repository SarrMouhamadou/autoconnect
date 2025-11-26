import { Link } from 'react-router-dom';
import {
    FiStar,
    FiMapPin,
    FiTruck,
    FiPhone,
    FiCheckCircle,
    FiClock
} from 'react-icons/fi';

export default function ConcessionCard({ concession }) {
    // Image par défaut
    const defaultImage = 'https://images.unsplash.com/photo-1562911791-c7a97b729ec5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    // Parser les services
    const parseServices = () => {
        if (!concession.services_disponibles) return [];

        if (Array.isArray(concession.services_disponibles)) {
            return concession.services_disponibles;
        }

        if (typeof concession.services_disponibles === 'string') {
            try {
                return JSON.parse(concession.services_disponibles);
            } catch (e) {
                return concession.services_disponibles.split(',').map(s => s.trim());
            }
        }

        return [];
    };

    const services = parseServices();

    // Labels des services
    const serviceLabels = {
        'LOCATION': 'Location',
        'VENTE': 'Vente',
        'ENTRETIEN': 'Entretien',
        'LIVRAISON': 'Livraison',
        'FINANCEMENT': 'Financement',
        'ASSURANCE': 'Assurance',
    };

    return (
        <Link
            to={`/concessions/${concession.id}`}
            className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200"
        >
            {/* Image de couverture */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                    src={concession.logo || defaultImage}
                    alt={concession.nom_entreprise}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Badge certifié */}
                {concession.statut_validation === 'VALIDEE' && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <FiCheckCircle className="text-sm" />
                        <span>Certifiée</span>
                    </div>
                )}

                {/* Nombre de véhicules */}
                <div className="absolute bottom-3 left-3 flex items-center space-x-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                    <FiTruck className="text-teal-600" />
                    <span className="text-sm font-semibold text-gray-900">
                        {concession.nombre_vehicules || 0} véhicules
                    </span>
                </div>
            </div>

            {/* Contenu */}
            <div className="p-5">
                {/* Nom de la concession */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {concession.nom_entreprise}
                </h3>

                {/* Note et avis */}
                {concession.note_moyenne && (
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <FiStar
                                    key={i}
                                    className={`text-sm ${i < Math.floor(concession.note_moyenne)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {concession.note_moyenne.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                            ({concession.nombre_avis || 0} avis)
                        </span>
                    </div>
                )}

                {/* Adresse */}
                <div className="flex items-start space-x-2 text-gray-600 mb-4">
                    <FiMapPin className="mt-1 flex-shrink-0 text-teal-600" />
                    <p className="text-sm line-clamp-2">
                        {concession.adresse}
                        {concession.ville && `, ${concession.ville}`}
                    </p>
                </div>

                {/* Services */}
                {services.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {services.slice(0, 3).map((service, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full"
                                >
                                    {serviceLabels[service] || service}
                                </span>
                            ))}
                            {services.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                    +{services.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Horaires (si disponibles) */}
                {concession.horaires_ouverture && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                        <FiClock className="text-teal-600" />
                        <span>Ouvert aujourd'hui</span>
                    </div>
                )}

                {/* Séparateur */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                        {/* Contact */}
                        {concession.telephone_entreprise && (
                            <div className="flex items-center space-x-2 text-gray-600">
                                <FiPhone className="text-sm" />
                                <span className="text-sm">{concession.telephone_entreprise}</span>
                            </div>
                        )}

                        {/* Bouton Voir plus */}
                        <span className="text-sm font-semibold text-teal-600 group-hover:text-teal-700 flex items-center space-x-1">
                            <span>Voir plus</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}