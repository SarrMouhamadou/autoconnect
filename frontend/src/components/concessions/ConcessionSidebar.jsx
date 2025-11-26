import {
    FiPhone,
    FiMail,
    FiClock,
    FiTruck,
    FiStar,
    FiAward,
    FiCheckCircle,
    FiMapPin
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function ConcessionSidebar({ concession }) {
    // Formater le numéro de téléphone pour WhatsApp
    const getWhatsAppLink = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        return `https://wa.me/${cleaned}`;
    };

    // Formater les horaires
    const formatHoraires = () => {
        if (!concession.horaires_ouverture) return null;

        try {
            const horaires = typeof concession.horaires_ouverture === 'string'
                ? JSON.parse(concession.horaires_ouverture)
                : concession.horaires_ouverture;

            return horaires;
        } catch (e) {
            return null;
        }
    };

    const horaires = formatHoraires();

    return (
        <div className="space-y-6">
            {/* Carte Contact */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                    <h3 className="font-semibold">Contact</h3>
                </div>

                <div className="p-4 space-y-4">
                    {/* Téléphone */}
                    {concession.telephone_entreprise && (
                        <a
                            href={`tel:${concession.telephone_entreprise}`}
                            className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                                <FiPhone className="text-teal-600 text-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Téléphone</p>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {concession.telephone_entreprise}
                                </p>
                            </div>
                        </a>
                    )}

                    {/* Email */}
                    {concession.email && (
                        <a
                            href={`mailto:${concession.email}`}
                            className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <FiMail className="text-blue-600 text-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {concession.email}
                                </p>
                            </div>
                        </a>
                    )}

                    {/* WhatsApp */}
                    {concession.telephone_entreprise && (
                        <a
                            href={getWhatsAppLink(concession.telephone_entreprise)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <FaWhatsapp className="text-green-600 text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">WhatsApp</p>
                                <p className="text-sm font-medium text-gray-900">
                                    Discuter maintenant
                                </p>
                            </div>
                        </a>
                    )}
                </div>
            </div>

            {/* Carte Horaires */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white flex items-center space-x-2">
                    <FiClock />
                    <h3 className="font-semibold">Horaires d'ouverture</h3>
                </div>

                <div className="p-4">
                    {horaires ? (
                        <div className="space-y-2">
                            {Object.entries(horaires).map(([jour, heures]) => (
                                <div key={jour} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-sm text-gray-600 capitalize">{jour}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {heures || 'Fermé'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Lun - Ven</span>
                                <span className="font-medium text-gray-900">8h00 - 18h00</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Samedi</span>
                                <span className="font-medium text-gray-900">9h00 - 17h00</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Dimanche</span>
                                <span className="font-medium text-red-600">Fermé</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Carte Statistiques */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                    <h3 className="font-semibold">Statistiques</h3>
                </div>

                <div className="p-4 space-y-3">
                    {/* Nombre de véhicules */}
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiTruck className="text-blue-600 text-lg" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {concession.nombre_vehicules || 0}
                            </p>
                            <p className="text-xs text-gray-600">Véhicules disponibles</p>
                        </div>
                    </div>

                    {/* Note moyenne */}
                    {concession.note_moyenne && (
                        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FiStar className="text-yellow-600 text-lg" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {concession.note_moyenne.toFixed(1)}/5
                                </p>
                                <p className="text-xs text-gray-600">
                                    {concession.nombre_avis || 0} avis
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Années d'expérience */}
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FiAward className="text-purple-600 text-lg" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {concession.annees_experience || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">Années d'expérience</p>
                        </div>
                    </div>

                    {/* Certification */}
                    {concession.statut_validation === 'VALIDEE' && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <FiCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-green-900">
                                    Concession certifiée
                                </p>
                                <p className="text-xs text-green-700">
                                    Vérifiée par AutoConnect
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Carte Adresse */}
            {concession.adresse && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white flex items-center space-x-2">
                        <FiMapPin />
                        <h3 className="font-semibold">Adresse</h3>
                    </div>

                    <div className="p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {concession.adresse}
                            {concession.ville && `, ${concession.ville}`}
                            {concession.region && `, ${concession.region}`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}