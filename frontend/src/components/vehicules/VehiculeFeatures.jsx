import { FiCheck } from 'react-icons/fi';

export default function VehiculeFeatures({ vehicule }) {
    // Équipements standard (par défaut tous)
    const standardFeatures = vehicule.equipements || [];

    // On peut aussi avoir des équipements optionnels si le backend les fournit
    const availableFeatures = vehicule.equipements_optionnels || [];

    if (standardFeatures.length === 0 && availableFeatures.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Équipements et fonctionnalités
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Équipements standard */}
                {standardFeatures.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Équipements de série
                        </h3>
                        <div className="space-y-3">
                            {standardFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3 text-gray-700"
                                >
                                    <FiCheck className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Équipements disponibles/optionnels */}
                {availableFeatures.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Équipements disponibles
                        </h3>
                        <div className="space-y-3">
                            {availableFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3 text-gray-700"
                                >
                                    <FiCheck className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Section équipements par défaut si liste vide mais véhicule a des features */}
            {standardFeatures.length === 0 && availableFeatures.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Aucun équipement spécifié pour ce véhicule
                </div>
            )}
        </div>
    );
}