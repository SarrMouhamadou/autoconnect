import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiClock, FiAlertCircle } from 'react-icons/fi';
import VehiculeCard from '../vehicules/VehiculeCard';
import axios from 'axios';

export default function ConcessionNewCars({ concessionId }) {
    const [vehicules, setVehicules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const vehiculesPerPage = 8; // 4×2
    const totalPages = Math.ceil(vehicules.length / vehiculesPerPage);

    // Calculer les véhicules à afficher
    const startIndex = (currentPage - 1) * vehiculesPerPage;
    const endIndex = startIndex + vehiculesPerPage;
    const currentVehicules = vehicules.slice(startIndex, endIndex);

    // Charger les derniers véhicules
    useEffect(() => {
        const fetchNewVehicules = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/vehicules/', {
                    params: {
                        concession: concessionId,
                        ordering: '-date_creation', // Les plus récents en premier
                        limit: 50, // Limite raisonnable
                    },
                });
                setVehicules(response.data.results || response.data);
                setError(null);
            } catch (err) {
                console.error('Erreur lors du chargement des nouveaux véhicules:', err);
                setError('Impossible de charger les véhicules.');
            } finally {
                setLoading(false);
            }
        };

        if (concessionId) {
            fetchNewVehicules();
        }
    }, [concessionId]);

    // Navigation pagination
    const goToPage = (page) => {
        setCurrentPage(page);
        // Scroll vers la section
        const element = document.getElementById('new-cars-section');
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
    if (loading) {
        return (
            <div id="new-cars-section" className="bg-white rounded-lg shadow-md p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    <p className="text-gray-600">Chargement des derniers véhicules...</p>
                </div>
            </div>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <div id="new-cars-section" className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center space-x-3 text-red-600">
                    <FiAlertCircle className="text-2xl" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Aucun véhicule
    if (vehicules.length === 0) {
        return (
            <div id="new-cars-section" className="bg-white rounded-lg shadow-md p-12 text-center">
                <FiClock className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500">Aucun véhicule récent disponible</p>
            </div>
        );
    }

    return (
        <div id="new-cars-section" className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <FiClock className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Derniers ajouts</h2>
                            <p className="text-sm text-teal-50 mt-1">
                                Les véhicules récemment ajoutés par cette concession
                            </p>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="hidden md:block">
                        <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                            🆕 {vehicules.length} nouveau{vehicules.length > 1 ? 'x' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Compteur de page mobile */}
            {totalPages > 1 && (
                <div className="md:hidden px-6 py-3 bg-gray-50 border-b border-gray-200 text-center">
                    <span className="text-sm text-gray-600">
                        Page {currentPage} sur {totalPages}
                    </span>
                </div>
            )}

            {/* Grille de véhicules 4×2 */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentVehicules.map((vehicule) => (
                        <div key={vehicule.id} className="relative">
                            {/* Badge NOUVEAU */}
                            <div className="absolute top-2 left-2 z-10 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                                🆕 NOUVEAU
                            </div>

                            <VehiculeCard vehicule={vehicule} />
                        </div>
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
                                // Logique d'affichage intelligente
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

                {/* Info bulle */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Astuce :</strong> Ces véhicules sont les plus récemment ajoutés par cette concession.
                        Consultez-les en priorité pour découvrir les dernières nouveautés !
                    </p>
                </div>
            </div>
        </div>
    );
}