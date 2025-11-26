import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FiChevronLeft,
    FiChevronRight,
    FiAlertCircle,
    FiMap,
    FiGrid
} from 'react-icons/fi';

// Composants
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ConcessionCard from '../../components/concessions/ConcessionCard';
import ConcessionsMapView from '../../components/concessions/ConcessionsMapView';
import ConcessionsFilters from '../../components/concessions/ConcessionsFilters';

export default function ConcessionsPage() {
    const [concessions, setConcessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'map'
    const [selectedConcession, setSelectedConcession] = useState(null);

    // Filtres
    const [filters, setFilters] = useState({
        search: '',
        ville: '',
        note_min: '',
        services: [],
        certifiee: false,
    });

    const concessionsPerPage = 12; // 3×4
    const totalPages = Math.ceil(totalCount / concessionsPerPage);

    // Charger les concessions
    useEffect(() => {
        const fetchConcessions = async () => {
            try {
                setLoading(true);

                // Construire les params de requête
                const params = {
                    page: currentPage,
                    page_size: concessionsPerPage,
                    statut_validation: 'VALIDEE', // Seulement les concessions validées
                };

                // Ajouter les filtres actifs
                if (filters.search) params.search = filters.search;
                if (filters.ville) params.ville = filters.ville;
                if (filters.note_min) params.note_min = filters.note_min;
                if (filters.certifiee) params.certifiee = true;
                if (filters.services?.length > 0) params.services = filters.services.join(',');

                const response = await axios.get('/api/concessions/', { params });

                setConcessions(response.data.results || []);
                setTotalCount(response.data.count || response.data.results?.length || 0);
                setError(null);
            } catch (err) {
                console.error('Erreur lors du chargement des concessions:', err);
                setError('Impossible de charger les concessions.');
            } finally {
                setLoading(false);
            }
        };

        fetchConcessions();
    }, [currentPage, filters]);

    // Gérer les changements de filtres
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1); // Réinitialiser la pagination
    };

    // Réinitialiser les filtres
    const resetFilters = () => {
        setFilters({
            search: '',
            ville: '',
            note_min: '',
            services: [],
            certifiee: false,
        });
        setCurrentPage(1);
    };

    // Navigation pagination
    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-blue-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Trouvez la concession idéale
                        </h1>
                        <p className="text-xl text-teal-50 max-w-3xl mx-auto">
                            Découvrez nos concessions partenaires certifiées au Sénégal.
                            Location, vente, et services de qualité pour tous vos besoins automobiles.
                        </p>

                        {/* Stats rapides */}
                        <div className="mt-8 flex flex-wrap justify-center gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{totalCount}</div>
                                <div className="text-sm text-teal-100">Concessions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">500+</div>
                                <div className="text-sm text-teal-100">Véhicules</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">4.8/5</div>
                                <div className="text-sm text-teal-100">Note moyenne</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filtres */}
                <div className="mb-8">
                    <ConcessionsFilters
                        filters={filters}
                        onChange={handleFilterChange}
                        onReset={resetFilters}
                    />
                </div>

                {/* Toggle Vue Carte / Grille */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {totalCount} concession{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Page {currentPage} sur {totalPages}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-md p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${viewMode === 'grid'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FiGrid />
                            <span className="hidden sm:inline">Grille</span>
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${viewMode === 'map'
                                    ? 'bg-teal-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FiMap />
                            <span className="hidden sm:inline">Carte</span>
                        </button>
                    </div>
                </div>

                {/* Vue Carte */}
                {viewMode === 'map' && (
                    <div className="mb-8">
                        <ConcessionsMapView
                            concessions={concessions}
                            selectedConcession={selectedConcession}
                            onSelectConcession={setSelectedConcession}
                        />
                    </div>
                )}

                {/* État de chargement */}
                {loading && currentPage === 1 ? (
                    <div className="bg-white rounded-lg shadow-md p-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                            <p className="text-gray-600">Chargement des concessions...</p>
                        </div>
                    </div>
                ) : error ? (
                    // État d'erreur
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8 flex items-center space-x-3">
                        <FiAlertCircle className="text-red-600 text-2xl flex-shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                ) : concessions.length > 0 ? (
                    // Grille de concessions
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {concessions.map((concession) => (
                                <ConcessionCard key={concession.id} concession={concession} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-8">
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
                                                            : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
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
                    </>
                ) : (
                    // Aucune concession trouvée
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <FiMap className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Aucune concession trouvée
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Aucune concession ne correspond à vos critères de recherche.
                        </p>
                        <button
                            onClick={resetFilters}
                            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}