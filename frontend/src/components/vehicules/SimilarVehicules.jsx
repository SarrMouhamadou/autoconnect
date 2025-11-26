import { Link } from 'react-router-dom';
import VehiculeCard from './VehiculeCard';

export default function SimilarVehicules({ vehicules = [], currentVehiculeId }) {
    // Filtrer le véhicule actuel de la liste
    const similarVehicules = vehicules.filter(v => v.id !== currentVehiculeId);

    if (similarVehicules.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Véhicules similaires
                </h2>
                {similarVehicules.length > 3 && (
                    <Link
                        to="/vehicules"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Voir tous →
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarVehicules.slice(0, 3).map((vehicule) => (
                    <VehiculeCard key={vehicule.id} vehicule={vehicule} />
                ))}
            </div>
        </div>
    );
}