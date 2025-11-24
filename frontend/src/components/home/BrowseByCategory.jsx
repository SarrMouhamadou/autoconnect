import { useNavigate } from 'react-router-dom';
import {
    FiTruck,
    FiArrowRight
} from 'react-icons/fi';

export default function BrowseByCategory() {
    const navigate = useNavigate();

    // Catégories de véhicules avec icônes/images
    const categories = [
        {
            id: 'BERLINE',
            name: 'Berline',
            count: 120,
            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            description: 'Confort et élégance pour vos trajets',
        },
        {
            id: 'SUV',
            name: 'SUV',
            count: 85,
            image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            description: 'Spacieux et polyvalent',
        },
        {
            id: '4X4',
            name: '4x4',
            count: 65,
            image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            description: 'Pour tous les terrains',
        },
        {
            id: 'COUPE',
            name: 'Coupé',
            count: 45,
            image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            description: 'Style sportif et dynamique',
        },
        {
            id: 'CITADINE',
            name: 'Citadine',
            count: 95,
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            description: 'Idéale pour la ville',
        },
        {
            id: 'UTILITAIRE',
            name: 'Utilitaire',
            count: 55,
            image: 'https://images.unsplash.com/photo-1527199768775-4ddb0f5e0f5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            description: 'Pour vos besoins professionnels',
        },
        {
            id: 'LUXE',
            name: 'Luxe',
            count: 30,
            image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            description: 'Excellence et prestige',
        },
        {
            id: 'MINIBUS',
            name: 'Minibus',
            count: 25,
            image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            description: 'Pour les groupes',
        },
    ];

    const handleCategoryClick = (categoryId) => {
        navigate(`/vehicules?type=${categoryId}`);
    };

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FiTruck className="text-blue-600 text-2xl" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Parcourir par catégorie
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Trouvez le type de véhicule qui correspond parfaitement à vos besoins
                    </p>
                </div>

                {/* Grid de catégories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                        >
                            {/* Image de la catégorie */}
                            <div className="relative h-48 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent z-10"></div>
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Badge nombre de véhicules */}
                                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {category.count} véhicules
                                    </span>
                                </div>

                                {/* Nom de la catégorie */}
                                <div className="absolute bottom-4 left-4 z-20">
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-gray-200">
                                        {category.description}
                                    </p>
                                </div>
                            </div>

                            {/* Footer avec icône */}
                            <div className="p-4 bg-white flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                                    Voir les véhicules
                                </span>
                                <FiArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Bouton voir toutes les catégories */}
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