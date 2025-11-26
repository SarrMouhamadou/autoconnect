import {
    FiInfo,
    FiCheckCircle,
    FiTruck,
    FiShoppingBag,
    FiTool,
    FiHome,
    FiCreditCard,
    FiShield
} from 'react-icons/fi';

export default function ConcessionInfo({ concession }) {
    // Icônes des services
    const serviceIcons = {
        'LOCATION': FiTruck,
        'VENTE': FiShoppingBag,
        'ENTRETIEN': FiTool,
        'LIVRAISON': FiHome,
        'FINANCEMENT': FiCreditCard,
        'ASSURANCE': FiShield,
    };

    // Labels des services
    const serviceLabels = {
        'LOCATION': 'Location de véhicules',
        'VENTE': 'Vente de véhicules',
        'ENTRETIEN': 'Entretien et réparation',
        'LIVRAISON': 'Livraison à domicile',
        'FINANCEMENT': 'Solutions de financement',
        'ASSURANCE': 'Assistance assurance',
    };

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

    return (
        <div className="space-y-6">
            {/* Section À propos */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center space-x-2">
                    <FiInfo className="text-teal-600 text-xl" />
                    <h2 className="text-xl font-bold text-gray-900">À propos</h2>
                </div>

                <div className="p-6">
                    {concession.description ? (
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {concession.description}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">
                            Aucune description disponible pour le moment.
                        </p>
                    )}

                    {/* Informations supplémentaires */}
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* SIRET */}
                        {concession.siret && (
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FiShield className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        SIRET
                                    </p>
                                    <p className="font-medium text-gray-900 font-mono">
                                        {concession.siret}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Années d'expérience */}
                        {concession.annees_experience && (
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FiCheckCircle className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Expérience
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {concession.annees_experience} ans dans le secteur
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Nombre de véhicules */}
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiTruck className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Flotte
                                </p>
                                <p className="font-medium text-gray-900">
                                    {concession.nombre_vehicules || 0} véhicules disponibles
                                </p>
                            </div>
                        </div>

                        {/* Site web */}
                        {concession.site_web && (
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <FiInfo className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Site web
                                    </p>
                                    <a
                                        href={concession.site_web}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                                    >
                                        Visiter le site
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section Services disponibles */}
            {services.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Services disponibles</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Découvrez les services proposés par cette concession
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map((service, index) => {
                                const Icon = serviceIcons[service] || FiCheckCircle;
                                const label = serviceLabels[service] || service;

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <Icon className="text-teal-600 text-2xl" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{label}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                Service disponible
                                            </p>
                                        </div>
                                        <FiCheckCircle className="text-green-600 text-xl" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Section Certifications (si validée) */}
            {concession.statut_validation === 'VALIDEE' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <FiShield className="text-green-600 text-3xl" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Concession certifiée AutoConnect
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Cette concession a été vérifiée et validée par notre équipe.
                                Tous les véhicules sont contrôlés et les informations sont exactes.
                                Vous pouvez réserver en toute confiance.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    <FiCheckCircle />
                                    <span>Identité vérifiée</span>
                                </span>
                                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    <FiCheckCircle />
                                    <span>Documents validés</span>
                                </span>
                                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    <FiCheckCircle />
                                    <span>Véhicules contrôlés</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}