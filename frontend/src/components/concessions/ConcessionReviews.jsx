import { useState, useEffect } from 'react';
import {
    FiStar,
    FiUser,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiAlertCircle,
    FiMessageSquare
} from 'react-icons/fi';
import axios from 'axios';

export default function ConcessionReviews({ concessionId }) {
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const avisPerPage = 5;
    const totalPages = Math.ceil(totalCount / avisPerPage);

    // Charger les avis
    useEffect(() => {
        const fetchAvis = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/avis/', {
                    params: {
                        concession: concessionId,
                        page: currentPage,
                        page_size: avisPerPage,
                        ordering: '-date_creation',
                    },
                });

                setAvis(response.data.results || []);
                setTotalCount(response.data.count || response.data.results?.length || 0);
                setError(null);
            } catch (err) {
                console.error('Erreur lors du chargement des avis:', err);
                setError('Impossible de charger les avis.');
            } finally {
                setLoading(false);
            }
        };

        if (concessionId) {
            fetchAvis();
        }
    }, [concessionId, currentPage]);

    // Navigation pagination
    const goToPage = (page) => {
        setCurrentPage(page);
        const element = document.getElementById('reviews-section');
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

    // Formater la date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Rendre les étoiles
    const renderStars = (note) => {
        return (
            <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                    <FiStar
                        key={i}
                        className={`${i < note
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    // État de chargement
    if (loading && currentPage === 1) {
        return (
            <div id="reviews-section" className="bg-white rounded-lg shadow-md p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    <p className="text-gray-600">Chargement des avis...</p>
                </div>
            </div>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <div id="reviews-section" className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center space-x-3 text-red-600">
                    <FiAlertCircle className="text-2xl" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Aucun avis
    if (avis.length === 0) {
        return (
            <div id="reviews-section" className="bg-white rounded-lg shadow-md p-12 text-center">
                <FiMessageSquare className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun avis pour le moment
                </h3>
                <p className="text-gray-600">
                    Cette concession n'a pas encore reçu d'avis. Soyez le premier à laisser votre avis !
                </p>
            </div>
        );
    }

    return (
        <div id="reviews-section" className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {totalCount} avis au total
                        </p>
                    </div>

                    {/* Note moyenne globale */}
                    <div className="text-right">
                        <div className="flex items-center space-x-2">
                            {renderStars(5)}
                            <span className="text-2xl font-bold text-gray-900">4.8</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Note moyenne</p>
                    </div>
                </div>
            </div>

            {/* Liste des avis */}
            <div className="p-6 space-y-6">
                {avis.map((avis) => (
                    <div
                        key={avis.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        {/* En-tête de l'avis */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {avis.client?.prenom?.[0] || avis.client?.nom?.[0] || 'A'}
                                </div>

                                {/* Nom et date */}
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {avis.client?.prenom} {avis.client?.nom?.charAt(0)}.
                                    </h3>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                        <FiCalendar className="text-xs" />
                                        <span>{formatDate(avis.date_creation)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="flex items-center space-x-2">
                                {renderStars(avis.note)}
                                <span className="font-semibold text-gray-900">{avis.note}/5</span>
                            </div>
                        </div>

                        {/* Contenu de l'avis */}
                        <div className="pl-16">
                            <p className="text-gray-700 leading-relaxed">
                                {avis.commentaire}
                            </p>

                            {/* Véhicule concerné */}
                            {avis.vehicule && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        Avis sur : <span className="font-medium text-gray-700">{avis.vehicule.nom_complet}</span>
                                    </p>
                                </div>
                            )}

                            {/* Réponse de la concession */}
                            {avis.reponse_concessionnaire && (
                                <div className="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-teal-500">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                            <FiMessageSquare className="text-teal-600 text-sm" />
                                        </div>
                                        <p className="font-semibold text-gray-900 text-sm">
                                            Réponse de la concession
                                        </p>
                                    </div>
                                    <p className="text-gray-700 text-sm pl-10">
                                        {avis.reponse_concessionnaire}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 pb-6">
                    <div className="flex items-center justify-center space-x-2 pt-6 border-t border-gray-200">
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
                </div>
            )}

            {/* Call to action */}
            <div className="px-6 pb-6">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 border border-teal-200">
                    <p className="text-center text-gray-700">
                        💡 <strong>Vous avez loué un véhicule ici ?</strong> Partagez votre expérience pour aider les autres utilisateurs !
                    </p>
                </div>
            </div>
        </div>
    );
}