import { useState, useEffect } from 'react';
import {
    FiChevronLeft,
    FiChevronRight,
    FiSearch,
    FiFilter,
    FiAlertCircle,
    FiTruck,
    FiX
} from 'react-icons/fi';
import VehiculeCard from '../vehicules/VehiculeCard';
import VehiculeFilters from '../vehicules/VehiculeFilters';
import axios from 'axios';

export default function ConcessionVehicules({ concessionId }) {
    const [vehicules, setVehicules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    // Filtres
    const [filters, setFilters] = useState({
        search: '',
        type_offre: '',
        marque: '',
        categorie: '',
        prix_min: '',
        prix_max: '',
        transmission: '',
        carburant: '',
        places_min: '',
        disponible: false,
    });

    const vehiculesPerPage = 8; // 4×2
    const totalPages = Math.ceil(totalCount / vehiculesPerPage);

    // Charger les véhicules
    useEffect(() => {
        const fetchVehicules = async () => {
            try {
                setLoading(true);
                const params = {
                    concession: concessionId,
                    page: currentPage,
                    page_size: vehiculesPerPage,
                    ...Object.fromEntries(
                        Object.entries(filters).filter(([_, value]) => value !== '' && value !== false)
                    ),
                };

                const response = await axios.get('/api/vehicules/', { params });

                setVehicules(response.data.results || []);
                setTotalCount(response.data.count || response.data.results?.length || 0);
                setError(null);
            } catch (err) {
                console.error('Erreur lors du chargement des véhicules:', err);
                setError('Impossible de charger les véhicules.');
            } finally {
                setLoading(false);
            }
        };

        if (concessionId) {
            fetchVehicules();
        }
    }, [concessionId, currentPage, filters]);

    // Gérer les changements de filtres
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Réinitialiser la pagination
    };

    // Réinitialiser les filtres
    const resetFilters = () => {
        setFilters({
            search: '',
            type_offre: '',
            marque: '',
            categorie: '',
            prix_min: '',
            prix_max: '',
            transmission: '',
            carburant: '',
            places_min: '',
            disponible: false,
        });
        setCurrentPage(1);
    };

    // Compter les filtres actifs
    const activeFiltersCount = Object.values(filters).filter(
        (value) => value !== '' && value !== false
    ).length;

    // Navigation pagination
    const goToPage = (page) => {
        setCurrentPage(page);
        const element = document.getElementById('vehicules-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    // État de chargement
    if (loading && currentPage === 1) {
        return (
            <div id="vehicules-section" className="bg-white rounded-lg shadow-md p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    <p className="text-gray-600">Chargement des véhicules...</p>
                </div>
            </div>
        );
    }

    return (
        <div id="vehicules-section" className="space-y-6">
            {/* En-tête avec recherche */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Tous les véhicules</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {totalCount} véhicule{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Barre de recherche */}
                        <div className="flex items-center space-x-3">
                            <div className="relative flex-1 md:w-80">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un véhicule..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            {/* Bouton filtres */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="relative px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <FiFilter />
                                <span>Filtres</span>
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filtres actifs */}
                    {activeFiltersCount > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-600">Filtres actifs :</span>
                            {Object.entries(filters).map(([key, value]) => {
                                if (value && value !== false) {
                                    return (
                                        <span
                                            key={key}
                                            className="inline-flex items-center space-x-1 px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
                                        >
                                            <span>{key}: {value.toString()}</span>
                                            <button
                                                onClick={() => handleFilterChange({ ...filters, [key]: '' })}
                                                className="hover:text-teal-900"
                                            >
                                                <FiX />
                                            </button>
                                        </span>
                                    );
                                }
                                return null;
                            })}
                            <button
                                onClick={resetFilters}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Réinitialiser tout
                            </button>
                        </div>
                    )}
                </div>

                {/* Panel des filtres */}
                {showFilters && (
                    <div className="border-t border-gray-200">
                        <VehiculeFilters
                            filters={filters}
                            onChange={handleFilterChange}
                            onReset={resetFilters}
                        />
                    </div>
                )}
            </div>

            {/* Erreur */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <FiAlertCircle className="text-red-600 text-xl flex-shrink-0" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Grille de véhicules */}
            {vehicules.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {vehicules.map((vehicule) => (
                            <VehiculeCard key={vehicule.id} vehicule={vehicule} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-gray-200">
                            {/* Bouton Précédent */}
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                <FiChevronLeft />
                                <span className="hidden sm:inline">Précédent</span>
                            </button>

                            {/* Numéros de page */}
                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    if (
                                        page <= 3 ||
                                        page > totalPages - 3 ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === currentPage
                                                        ? 'bg-teal-600 text-white shadow-lg'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === 4 || page === totalPages - 3) {
                                        return (
                                            <span key={page} className="px-2 text-gray-400">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Bouton Suivant */}
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                <span className="hidden sm:inline">Suivant</span>
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiTruck className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucun véhicule trouvé
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Aucun véhicule ne correspond à vos critères de recherche.
                    </p>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Réinitialiser les filtres
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}