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
    FiDollarSign
} from 'react-icons/fi';

export default function VehiculesVente() {
    const navigate = useNavigate();
    const [hoveredVehicle, setHoveredVehicle] = useState(null);

    // Données statiques des véhicules en vente
    const vehiculesVente = [
        {
            id: 2,
            nom: 'BMW X5 M50i',
            marque: 'BMW',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixVente: 35000000,
            annee: 2022,
            kilometrage: 25000,
            note: 4.9,
            nombreAvis: 89,
            caracteristiques: {
                places: 7,
                transmission: 'Automatique',
                carburant: 'Diesel',
            },
            concession: 'Plateau Premium',
            disponible: true,
        },
        {
            id: 6,
            nom: 'Porsche Cayenne',
            marque: 'Porsche',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixVente: 52000000,
            annee: 2023,
            kilometrage: 8000,
            note: 4.9,
            nombreAvis: 45,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Essence',
            },
            concession: 'Luxury Cars Dakar',
            disponible: true,
        },
        {
            id: 11,
            nom: 'Lexus RX 350',
            marque: 'Lexus',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixVente: 28000000,
            annee: 2021,
            kilometrage: 42000,
            note: 4.7,
            nombreAvis: 78,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Hybride',
            },
            concession: 'Almadies Luxury',
            disponible: true,
        },
        {
            id: 12,
            nom: 'Toyota Land Cruiser',
            marque: 'Toyota',
            categorie: '4x4',
            image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixVente: 42000000,
            annee: 2022,
            kilometrage: 18000,
            note: 4.8,
            nombreAvis: 92,
            caracteristiques: {
                places: 7,
                transmission: 'Automatique',
                carburant: 'Diesel',
            },
            concession: 'Ouakam 4x4',
            disponible: true,
        },
        {
            id: 13,
            nom: 'Audi Q7 S-Line',
            marque: 'Audi',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixVente: 38000000,
            annee: 2023,
            kilometrage: 12000,
            note: 4.6,
            nombreAvis: 56,
            caracteristiques: {
                places: 7,
                transmission: 'Automatique',
                carburant: 'Diesel',
            },
            concession: 'VIP Motors',
            disponible: true,
        },
        {
            id: 14,
            nom: 'Mercedes GLE 450',
            marque: 'Mercedes',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixVente: 45000000,
            annee: 2023,
            kilometrage: 15000,
            note: 4.9,
            nombreAvis: 67,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Hybride',
            },
            concession: 'Point E Auto',
            disponible: true,
        },
    ];

    const handleVehicleClick = (vehicleId) => {
        navigate(`/vehicules/${vehicleId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR').format(price);
    };

    const formatKilometrage = (km) => {
        return new Intl.NumberFormat('fr-FR').format(km);
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <FiDollarSign className="text-purple-600 text-2xl" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Véhicules disponibles à la vente
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Trouvez le véhicule de vos rêves parmi notre sélection de qualité
                    </p>
                </div>

                {/* Grid de véhicules */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vehiculesVente.map((vehicle) => (
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

                                {/* Badge VENTE - Transparent */}
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
                                        <span className="text-white font-semibold text-sm">
                                            Vente
                                        </span>
                                    </div>
                                </div>

                                {/* Bouton favori */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Logique favori à implémenter
                                    }}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all group/fav"
                                >
                                    <FiHeart className="text-gray-600 group-hover/fav:text-red-500 transition-colors" />
                                </button>

                                {/* Infos véhicule */}
                                <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                                        {vehicle.categorie}
                                    </span>
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                                        {vehicle.annee}
                                    </span>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-6">
                                {/* Nom et note */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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

                                {/* Kilométrage et concession */}
                                <div className="mb-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Kilométrage</span>
                                        <span className="font-medium text-gray-900">{formatKilometrage(vehicle.kilometrage)} km</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiMapPin className="text-gray-400 text-sm" />
                                        <span className="text-sm text-gray-600">{vehicle.concession}</span>
                                    </div>
                                </div>

                                {/* Prix et bouton */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatPrice(vehicle.prixVente)} FCFA
                                        </div>
                                        <div className="text-sm text-gray-500">Prix de vente</div>
                                    </div>
                                    <button
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
                                    >
                                        <span>Voir détails</span>
                                        <FiArrowRight className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bouton voir tous les véhicules en vente */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate('/vehicules?type=VENTE')}
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl group"
                    >
                        <span>Voir tous les véhicules en vente</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}