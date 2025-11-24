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
    FiCalendar
} from 'react-icons/fi';

export default function VehiculesLocation() {
    const navigate = useNavigate();
    const [hoveredVehicle, setHoveredVehicle] = useState(null);

    // Données statiques des véhicules en location
    const vehiculesLocation = [
        {
            id: 1,
            nom: 'Toyota Camry SE 400',
            marque: 'Toyota',
            categorie: 'Berline',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixJour: 25000,
            note: 4.8,
            nombreAvis: 124,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Essence',
            },
            concession: 'Dakar Centre',
            disponible: true,
        },
        {
            id: 5,
            nom: 'Audi A6 55 TFSI',
            marque: 'Audi',
            categorie: 'Berline',
            image: 'https://images.unsplash.com/photo-1610768764270-790fbec18178?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixJour: 35000,
            note: 4.6,
            nombreAvis: 98,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Essence',
            },
            concession: 'Point E Auto',
            disponible: true,
        },
        {
            id: 7,
            nom: 'Peugeot 508 GT',
            marque: 'Peugeot',
            categorie: 'Berline',
            image: 'https://images.unsplash.com/photo-1555626906-fcf10d6851b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixJour: 28000,
            note: 4.5,
            nombreAvis: 72,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Diesel',
            },
            concession: 'Sicap Location',
            disponible: true,
        },
        {
            id: 8,
            nom: 'Nissan Patrol',
            marque: 'Nissan',
            categorie: '4x4',
            image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixJour: 48000,
            note: 4.7,
            nombreAvis: 53,
            caracteristiques: {
                places: 7,
                transmission: 'Automatique',
                carburant: 'Diesel',
            },
            concession: 'Ouakam 4x4',
            disponible: true,
        },
        {
            id: 9,
            nom: 'Hyundai Tucson',
            marque: 'Hyundai',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixJour: 32000,
            note: 4.4,
            nombreAvis: 88,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Essence',
            },
            concession: 'Liberté Auto',
            disponible: true,
        },
        {
            id: 10,
            nom: 'Volkswagen Tiguan',
            marque: 'Volkswagen',
            categorie: 'SUV',
            image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            prixJour: 36000,
            note: 4.6,
            nombreAvis: 64,
            caracteristiques: {
                places: 5,
                transmission: 'Automatique',
                carburant: 'Diesel',
            },
            concession: 'Mermoz Premium',
            disponible: true,
        },
    ];

    const handleVehicleClick = (vehicleId) => {
        navigate(`/vehicules/${vehicleId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR').format(price);
    };

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <FiCalendar className="text-green-600 text-2xl" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Véhicules disponibles en location
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Louez le véhicule parfait pour vos déplacements, à des tarifs compétitifs
                    </p>
                </div>

                {/* Grid de véhicules */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vehiculesLocation.map((vehicle) => (
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

                                {/* Badge LOCATION - Transparent */}
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg">
                                        <span className="text-white font-semibold text-sm">
                                            Location
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

                                {/* Catégorie */}
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                                        {vehicle.categorie}
                                    </span>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-6">
                                {/* Nom et note */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
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
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatPrice(vehicle.prixJour)} FCFA
                                        </div>
                                        <div className="text-sm text-gray-500">par jour</div>
                                    </div>
                                    <button
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all flex items-center space-x-2"
                                    >
                                        <span>Voir détails</span>
                                        <FiArrowRight className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bouton voir tous les véhicules en location */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate('/vehicules?type=LOCATION')}
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl group"
                    >
                        <span>Voir tous les véhicules en location</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}