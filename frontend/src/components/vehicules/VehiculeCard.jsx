import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiHeart,
    FiStar,
    FiUsers,
    FiSettings,
    FiZap,
    FiMapPin,
    FiCalendar,
    FiTag,
    FiCheckSquare,
    FiSquare
} from 'react-icons/fi';
import { useCompare } from '../../context/CompareContext';

export default function VehiculeCard({ vehicule, onFavoriteToggle }) {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(vehicule.is_favorite || false);
    const [isHovered, setIsHovered] = useState(false);

    // Hook de comparaison
    const { isInCompare, addToCompare, removeFromCompare } = useCompare();
    const isSelected = isInCompare(vehicule.id);

    // Fonction pour obtenir le label du type d'offre
    const getTypeOffreLabel = (type) => {
        const labels = {
            'LOCATION': 'Location',
            'VENTE': 'Vente',
            'LOCATION_VENTE': 'Location & Vente',
        };
        return labels[type] || '';
    };

    // Fonction pour obtenir les couleurs selon le type
    const getTypeColor = (type) => {
        const colors = {
            'LOCATION': 'bg-green-500',
            'VENTE': 'bg-purple-500',
            'LOCATION_VENTE': 'bg-blue-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    // Formater le prix
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR').format(price);
    };

    // Gérer le clic sur le favori
    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        if (onFavoriteToggle) {
            onFavoriteToggle(vehicule.id, !isFavorite);
        }
    };

    // Gérer le clic sur le bouton comparer
    const handleCompareClick = (e) => {
        e.stopPropagation(); // Empêcher la navigation vers la page détail

        if (isSelected) {
            removeFromCompare(vehicule.id);
        } else {
            addToCompare(vehicule.id);
        }
    };

    // Redirection vers les détails
    const handleCardClick = () => {
        navigate(`/vehicules/${vehicule.id}`);
    };

    // Obtenir l'image principale
    const getMainImage = () => {
        if (vehicule.photos && vehicule.photos.length > 0) {
            return vehicule.photos[0].image || vehicule.photos[0].url;
        }
        return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={getMainImage()}
                    alt={vehicule.nom || `${vehicule.marque?.nom} ${vehicule.modele}`}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>

                {/* Badge TYPE D'OFFRE - Transparent */}
                <div className="absolute top-4 left-4">
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
                        <span className="text-white font-semibold text-sm">
                            {getTypeOffreLabel(vehicule.type_offre)}
                        </span>
                    </div>
                </div>

                {/* Badge Promotion (si applicable) */}
                {vehicule.promotion && (
                    <div className="absolute top-4 right-14">
                        <div className="px-3 py-1.5 bg-red-500 rounded-lg flex items-center space-x-1">
                            <FiTag className="text-white text-sm" />
                            <span className="text-white font-semibold text-sm">
                                -{vehicule.promotion.pourcentage}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Bouton favori */}
                <button
                    onClick={handleFavoriteClick}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all group/fav ${isFavorite
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-white/90 backdrop-blur-sm hover:bg-white'
                        }`}
                >
                    <FiHeart
                        className={`transition-colors ${isFavorite ? 'text-white fill-current' : 'text-gray-600 group-hover/fav:text-red-500'
                            }`}
                    />
                </button>

                {/* Statut disponibilité */}
                <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vehicule.disponible
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                        }`}>
                        {vehicule.disponible ? 'Disponible' : 'Indisponible'}
                    </span>
                </div>

                {/* Badge catégorie */}
                <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                        {vehicule.categorie?.nom || 'N/A'}
                    </span>
                </div>
            </div>

            {/* Contenu */}
            <div className="p-6">
                {/* Nom et marque */}
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {vehicule.nom || `${vehicule.marque?.nom} ${vehicule.modele}`}
                    </h3>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-sm">
                            {vehicule.marque?.nom} • {vehicule.annee}
                        </p>
                        {vehicule.note_moyenne && (
                            <div className="flex items-center space-x-1">
                                <FiStar className="text-yellow-400 fill-current text-sm" />
                                <span className="font-semibold text-gray-900 text-sm">
                                    {vehicule.note_moyenne}
                                </span>
                                {vehicule.nombre_avis > 0 && (
                                    <span className="text-gray-500 text-xs">
                                        ({vehicule.nombre_avis})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Caractéristiques */}
                <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex flex-col items-center">
                        <FiUsers className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600 text-center">
                            {vehicule.nombre_places} places
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <FiSettings className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600 text-center">
                            {vehicule.type_transmission || 'N/A'}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <FiZap className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600 text-center">
                            {vehicule.type_carburant || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Localisation */}
                {vehicule.concession && (
                    <div className="flex items-center space-x-2 mb-4">
                        <FiMapPin className="text-gray-400 text-sm flex-shrink-0" />
                        <span className="text-sm text-gray-600 line-clamp-1">
                            {vehicule.concession.nom}
                        </span>
                    </div>
                )}

                {/* Prix */}
                <div className="mb-4">
                    {vehicule.type_offre === 'LOCATION' || vehicule.type_offre === 'LOCATION_VENTE' ? (
                        <>
                            <div className="text-2xl font-bold text-gray-900">
                                {formatPrice(vehicule.prix_journalier)} FCFA
                            </div>
                            <div className="text-sm text-gray-500">par jour</div>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold text-gray-900">
                                {formatPrice(vehicule.prix_vente)} FCFA
                            </div>
                            <div className="text-sm text-gray-500">prix de vente</div>
                        </>
                    )}
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center space-x-2">
                    {/* Bouton Comparer - NOUVEAU */}
                    <button
                        onClick={handleCompareClick}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg font-medium transition-all ${isSelected
                                ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        title={isSelected ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
                    >
                        {isSelected ? (
                            <>
                                <FiCheckSquare className="text-lg" />
                                <span className="text-sm font-semibold">Ajouté</span>
                            </>
                        ) : (
                            <>
                                <FiSquare className="text-lg" />
                                <span className="text-sm">Comparer</span>
                            </>
                        )}
                    </button>

                    {/* Bouton Voir détails */}
                    <button
                        className={`flex-1 px-4 py-2.5 font-medium rounded-lg transition-all flex items-center justify-center space-x-2 ${vehicule.type_offre === 'LOCATION'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : vehicule.type_offre === 'VENTE'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        <span>Voir détails</span>
                    </button>
                </div>
            </div>
        </div>
    );
}