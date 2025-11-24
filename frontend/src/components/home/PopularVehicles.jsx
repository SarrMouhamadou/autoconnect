import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiStar,
    FiUsers,
    FiSettings,
    FiZap,
    FiHeart,
    FiArrowRight,
    FiMapPin,
    FiEye,
    FiTrendingUp
} from 'react-icons/fi';

export default function PopularVehicles() {
    const navigate = useNavigate();
    const [hoveredVehicle, setHoveredVehicle] = useState(null);

    // Données statiques des véhicules les plus vus/recherchés
    const popularVehicles = [
        {
            id: 1,
            nom: 'Toyota Camry SE 400',
            marque: 'Toyota',
            categorie: 'Berline',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            type_offre: 'LOCATION', // LOCATION | VENTE | LOCATION_VENTE
            prixJour: 25000,
            prixVente: null,
            note: 4.8,
            nombreAvis: 124,
            nombreVues: 1250,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Essence',
            },
            concession: 'Dakar Centre',
            badges: ['Populaire'],
            disponible: true,
        },
        {
            id: 2,
            nom: 'BMW X5 M50i',
            marque: 'BMW',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            type_offre: 'VENTE',
            prixJour: null,
            prixVente: 35000000,
            note: 4.9,
            nombreAvis: 89,
            nombreVues: 980,
            caracteristiques: {
                places: 7,
                transmission: 'Automatique',
                carburant: 'Diesel',
            },
            concession: 'Plateau Premium',
            badges: ['Luxe'],
            disponible: true,
        },
        {
            id: 3,
            nom: 'Mercedes-Benz E300',
            marque: 'Mercedes',
            categorie: 'Berline',
            image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            type_offre: 'LOCATION_VENTE',
            prixJour: 38000,
            prixVente: 28000000,
            note: 4.7,
            nombreAvis: 156,
            nombreVues: 1450,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Hybride',
            },
            concession: 'Almadies Luxury',
            badges: ['Populaire'],
            disponible: true,
        },
        {
            id: 4,
            nom: 'Range Rover Sport',
            marque: 'Land Rover',
            categorie: '4x4',
            image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            type_offre: 'LOCATION_VENTE',
            prixJour: 55000,
            prixVente: 45000000,
            note: 5.0,
            nombreAvis: 67,
            nombreVues: 1120,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Diesel',
            },
            concession: 'VIP Motors',
            badges: ['Premium'],
            disponible: true,
        },
        {
            id: 5,
            nom: 'Audi A6 55 TFSI',
            marque: 'Audi',
            categorie: 'Berline',
            image: 'https://images.unsplash.com/photo-1610768764270-790fbec18178?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            type_offre: 'LOCATION',
            prixJour: 35000,
            prixVente: null,
            note: 4.6,
            nombreAvis: 98,
            nombreVues: 890,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Essence',
            },
            concession: 'Point E Auto',
            badges: [],
            disponible: true,
        },
        {
            id: 6,
            nom: 'Porsche Cayenne',
            marque: 'Porsche',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            type_offre: 'VENTE',
            prixJour: null,
            prixVente: 52000000,
            note: 4.9,
            nombreAvis: 45,
            nombreVues: 760,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Essence',
            },
            concession: 'Luxury Cars Dakar',
            badges: ['Luxe'],
            disponible: true,
        },
    ];

    const handleVehicleClick = (vehicleId) => {
        navigate(`/vehicules/${vehicleId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR').format(price);
    };

    // Fonction pour obtenir le label du type d'offre
    const getTypeOffreLabel = (type) => {
        const labels = {
            'LOCATION': 'Location',
            'VENTE': 'Vente',
            'LOCATION_VENTE': 'Location & Vente',
        };
        return labels[type] || '';
    };

    // Fonction pour obtenir le prix à afficher
    const getPriceDisplay = (vehicle) => {
        if (vehicle.type_offre === 'LOCATION') {
            return {
                price: vehicle.prixJour,
                unit: '/jour',
            };
        } else if (vehicle.type_offre === 'VENTE') {
            return {
                price: vehicle.prixVente,
                unit: '',
            };
        } else { // LOCATION_VENTE
            return {
                price: vehicle.prixJour,
                unit: '/jour',
                secondPrice: vehicle.prixVente,
            };
        }
    };

    const getBadgeColor = (badge) => {
        const colors = {
            'Populaire': 'bg-blue-100 text-blue-700',
            'Luxe': 'bg-purple-100 text-purple-700',
            'Premium': 'bg-yellow-100 text-yellow-700',
        };
        return colors[badge] || 'bg-gray-100 text-gray-700';
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FiTrendingUp className="text-blue-600 text-2xl" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Véhicules les plus recherchés
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Découvrez les véhicules les plus consultés et les plus populaires du moment
                    </p>
                </div>

                {/* Grid de véhicules */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {popularVehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            onMouseEnter={() => setHoveredVehicle(vehicle.id)}
                            onMouseLeave={() => setHoveredVehicle(null)}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                            onClick={() => handleVehicleClick(vehicle.id)}
                        >
                            {/* Image */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={vehicle.image}
                                    alt={vehicle.nom}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>

                                {/* Badge TYPE D'OFFRE - Transparent */}
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
                                        <span className="text-white font-semibold text-sm">
                                            {getTypeOffreLabel(vehicle.type_offre)}
                                        </span>
                                    </div>
                                </div>

                                {/* Autres badges */}
                                {vehicle.badges.length > 0 && (
                                    <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
                                        {vehicle.badges.map((badge) => (
                                            <span
                                                key={badge}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(badge)}`}
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Bouton favori */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Logique favori à implémenter
                                    }}
                                    className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all group/fav"
                                >
                                    <FiHeart className="text-gray-600 group-hover/fav:text-red-500 transition-colors" />
                                </button>

                                {/* Nombre de vues */}
                                <div className="absolute bottom-4 left-4 flex items-center space-x-1 px-2 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
                                    <FiEye className="text-white text-sm" />
                                    <span className="text-white text-xs font-medium">{vehicle.nombreVues}</span>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-6">
                                {/* Nom et note */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {vehicle.nom}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1">
                                            <FiStar className="text-yellow-400 fill-current" />
                                            <span className="font-semibold text-gray-900">{vehicle.note}</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">
                                            ({vehicle.nombreAvis} avis)
                                        </span>
                                    </div>
                                </div>

                                {/* Caractéristiques */}
                                <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex flex-col items-center">
                                        <FiUsers className="text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-600">{vehicle.caracteristiques.places} places</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <FiSettings className="text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-600 text-center">{vehicle.caracteristiques.transmission}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <FiZap className="text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-600">{vehicle.caracteristiques.carburant}</span>
                                    </div>
                                </div>

                                {/* Concession */}
                                <div className="flex items-center space-x-2 mb-4">
                                    <FiMapPin className="text-gray-400 text-sm" />
                                    <span className="text-sm text-gray-600">{vehicle.concession}</span>
                                </div>

                                {/* Prix et bouton */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        {(() => {
                                            const priceDisplay = getPriceDisplay(vehicle);
                                            return (
                                                <>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {formatPrice(priceDisplay.price)} FCFA{priceDisplay.unit}
                                                    </div>
                                                    {priceDisplay.secondPrice && (
                                                        <div className="text-sm text-gray-500">
                                                            ou {formatPrice(priceDisplay.secondPrice)} FCFA
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <button
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
                                    >
                                        <span>Voir détails</span>
                                        <FiArrowRight className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bouton voir tous les véhicules */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate('/vehicules')}
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl group"
                    >
                        <span>Voir tous les véhicules</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}