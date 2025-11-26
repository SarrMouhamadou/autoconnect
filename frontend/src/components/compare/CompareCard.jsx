import { FiX, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function CompareCard({ vehicule, onRemove, isBestValue = false }) {
    const defaultImage = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    // Calculer le prix total pour 3 jours
    const prixJour = vehicule.type_offre === 'LOCATION' ? vehicule.prix_location_jour : vehicule.prix_vente;
    const totalTroisJours = prixJour ? (prixJour * 3).toFixed(0) : 0;

    // Formater le prix
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
            {/* Bouton supprimer */}
            <button
                onClick={onRemove}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                title="Retirer de la comparaison"
            >
                <FiX className="text-lg" />
            </button>

            {/* Badge BEST VALUE */}
            {isBestValue && (
                <div className="absolute top-3 left-3 z-10 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold rounded-full shadow-lg">
                    MEILLEUR PRIX
                </div>
            )}

            {/* Image du véhicule */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                    src={vehicule.photos?.[0]?.image || defaultImage}
                    alt={vehicule.nom_complet}
                    className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Contenu */}
            <div className="p-5 space-y-4">
                {/* Nom du véhicule */}
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                        {vehicule.nom_complet}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                        {vehicule.categorie?.nom || 'Sport Car'}
                    </p>
                </div>

                {/* Prix */}
                <div className="border-t border-gray-100 pt-4">
                    <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {formatPrice(prixJour)}
                            <span className="text-base font-normal text-gray-500">/jour</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {formatPrice(totalTroisJours)} total pour 3 jours
                        </p>
                    </div>

                    {/* Bouton Book Now */}
                    <Link
                        to={`/vehicules/${vehicule.id}`}
                        className="block w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold text-center rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Réserver maintenant
                    </Link>
                </div>
            </div>
        </div>
    );
}