import { useNavigate } from 'react-router-dom';
import {
    FiMapPin,
    FiStar,
    FiPhone,
    FiClock,
    FiArrowRight,
    FiTruck
} from 'react-icons/fi';

export default function ConcessionsNearYou() {
    const navigate = useNavigate();

    // Données statiques des concessions populaires
    const concessions = [
        {
            id: 1,
            nom: 'AutoConnect Dakar Centre',
            ville: 'Dakar',
            quartier: 'Plateau',
            adresse: 'Avenue Léopold Sédar Senghor',
            image: 'https://images.unsplash.com/photo-1562911791-c7a97b729ec5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            note: 4.8,
            nombreAvis: 245,
            nombreVehicules: 65,
            telephone: '+221 33 123 45 67',
            horaires: 'Lun-Sam: 8h-18h',
            services: ['Location', 'Vente', 'Entretien'],
            distance: '2.5 km',
        },
        {
            id: 2,
            nom: 'Plateau Premium Motors',
            ville: 'Dakar',
            quartier: 'Plateau',
            adresse: 'Rue Mohamed V',
            image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            note: 4.9,
            nombreAvis: 189,
            nombreVehicules: 52,
            telephone: '+221 33 234 56 78',
            horaires: 'Lun-Sam: 9h-19h',
            services: ['Location', 'Vente'],
            distance: '3.2 km',
        },
        {
            id: 3,
            nom: 'Almadies Luxury Cars',
            ville: 'Dakar',
            quartier: 'Almadies',
            adresse: 'Route de Ngor',
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            note: 5.0,
            nombreAvis: 156,
            nombreVehicules: 38,
            telephone: '+221 33 345 67 89',
            horaires: 'Lun-Dim: 8h-20h',
            services: ['Vente', 'Location', 'Service VIP'],
            distance: '5.8 km',
        },
        {
            id: 4,
            nom: 'Point E Auto Location',
            ville: 'Dakar',
            quartier: 'Point E',
            adresse: 'Avenue Cheikh Anta Diop',
            image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            note: 4.7,
            nombreAvis: 198,
            nombreVehicules: 48,
            telephone: '+221 33 456 78 90',
            horaires: 'Lun-Sam: 8h-18h',
            services: ['Location', 'Vente'],
            distance: '4.1 km',
        },
    ];

    const handleConcessionClick = (concessionId) => {
        navigate(`/concessions/${concessionId}`);
    };

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <FiMapPin className="text-orange-600 text-2xl" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Concessions près de vous
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Découvrez nos agences partenaires à Dakar et trouvez celle la plus proche de vous
                    </p>
                </div>

                {/* Grid de concessions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {concessions.map((concession) => (
                        <div
                            key={concession.id}
                            onClick={() => handleConcessionClick(concession.id)}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={concession.image}
                                    alt={concession.nom}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent"></div>

                                {/* Badge distance */}
                                <div className="absolute top-4 right-4">
                                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                                        <div className="flex items-center space-x-1">
                                            <FiMapPin className="text-orange-600 text-sm" />
                                            <span className="text-gray-900 font-semibold text-xs">
                                                {concession.distance}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                                        <div className="flex items-center space-x-1">
                                            <FiStar className="text-yellow-400 fill-current text-sm" />
                                            <span className="text-gray-900 font-semibold text-xs">
                                                {concession.note}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Nom et localisation */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                                        {concession.nom}
                                    </h3>
                                    <p className="text-sm text-gray-200 flex items-center space-x-1">
                                        <FiMapPin className="text-xs" />
                                        <span>{concession.quartier}, {concession.ville}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-5">
                                {/* Nombre de véhicules */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <FiTruck className="text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {concession.nombreVehicules} véhicules
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {concession.nombreAvis} avis
                                    </div>
                                </div>

                                {/* Services */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {concession.services.map((service) => (
                                            <span
                                                key={service}
                                                className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Horaires */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                                    <FiClock className="text-gray-400 flex-shrink-0" />
                                    <span className="line-clamp-1">{concession.horaires}</span>
                                </div>

                                {/* Téléphone */}
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                                    <FiPhone className="text-gray-400 flex-shrink-0" />
                                    <a
                                        href={`tel:${concession.telephone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="hover:text-orange-600 transition-colors"
                                    >
                                        {concession.telephone}
                                    </a>
                                </div>

                                {/* Bouton */}
                                <button
                                    className="w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all flex items-center justify-center space-x-2 group"
                                >
                                    <span>Voir la concession</span>
                                    <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bouton voir toutes les concessions */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate('/concessions')}
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl group"
                    >
                        <span>Voir toutes les concessions</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Section carte (optionnelle) */}
                <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Trouvez la concession la plus proche
                        </h3>
                        <p className="text-gray-600">
                            Utilisez notre carte interactive pour localiser nos agences partenaires
                        </p>
                    </div>

                    {/* Placeholder pour la carte */}
                    <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
                        <div className="text-center">
                            <FiMapPin className="text-gray-400 text-6xl mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Carte interactive</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Intégration Leaflet/Google Maps à venir
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/concessions')}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all"
                        >
                            <FiMapPin />
                            <span>Voir sur la carte</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}