import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import avisService from '../../services/avisService';
import {
    FiStar, FiMessageSquare, FiCheck, FiX,
    FiAlertCircle, FiEdit2, FiTrash2
} from 'react-icons/fi';

export default function AvisPage() {
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAvis();
    }, []);

    const loadAvis = async () => {
        try {
            setLoading(true);
            
            const data = await avisService.getMesAvis();
             const avisArray = Array.isArray(data) 
            ? data 
            : (data.results || []);

            setAvis(avisArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSupprimerAvis = async (avisId) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet avis ?')) {
            try {
                await avisService.supprimerAvis(avisId);
                loadAvis();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderStars = (note) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`w-5 h-5 ${star <= note
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const getBadgeStatut = (avis) => {
        if (!avis.est_valide) {
            return (
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                    <FiAlertCircle className="w-3 h-3" />
                    <span>En attente de validation</span>
                </span>
            );
        }
        if (avis.est_signale) {
            return (
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                    <FiAlertCircle className="w-3 h-3" />
                    <span>Signalé</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                <FiCheck className="w-3 h-3" />
                <span>Publié</span>
            </span>
        );
    };

    // Calculer les statistiques
    const statistiques = {
        total: avis.length,
        valides: avis.filter(a => a.est_valide).length,
        avec_reponse: avis.filter(a => a.reponse).length,
        note_moyenne: avis.length > 0
            ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1)
            : 0
    };

    return (
        <DashboardLayout title="Mes avis">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mes avis</h1>
                <p className="text-gray-600 mt-1">
                    Consultez et gérez vos avis sur les véhicules loués
                </p>
            </div>

            {/* Statistiques */}
            {!loading && avis.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total d'avis</p>
                                <p className="text-2xl font-bold text-gray-900">{statistiques.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FiMessageSquare className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Note moyenne</p>
                                <div className="flex items-center space-x-2">
                                    <p className="text-2xl font-bold text-gray-900">{statistiques.note_moyenne}</p>
                                    <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FiStar className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avis publiés</p>
                                <p className="text-2xl font-bold text-gray-900">{statistiques.valides}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avec réponse</p>
                                <p className="text-2xl font-bold text-gray-900">{statistiques.avec_reponse}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiMessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenu */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-red-800">Erreur</h3>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                </div>
            ) : avis.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun avis
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Louez un véhicule et partagez votre expérience en laissant un avis
                    </p>
                    <Link
                        to="/client/locations"
                        className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Voir mes locations
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {avis.map((avis) => (
                        <div
                            key={avis.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                        >
                            {/* En-tête */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Link
                                            to={`/vehicules/${avis.vehicule.id}`}
                                            className="text-lg font-semibold text-gray-900 hover:text-teal-600"
                                        >
                                            {avis.vehicule.nom_complet}
                                        </Link>
                                        {getBadgeStatut(avis)}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>Publié le {formatDate(avis.date_creation)}</span>
                                        {avis.recommande && (
                                            <span className="inline-flex items-center space-x-1 text-teal-600">
                                                <FiCheck className="w-4 h-4" />
                                                <span>Je recommande</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleSupprimerAvis(avis.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Supprimer"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Note globale et détails */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Note globale</p>
                                    {renderStars(avis.note)}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {avis.note_confort && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Confort:</span>
                                            <div className="flex items-center space-x-1">
                                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="font-medium">{avis.note_confort}/5</span>
                                            </div>
                                        </div>
                                    )}
                                    {avis.note_performance && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Performance:</span>
                                            <div className="flex items-center space-x-1">
                                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="font-medium">{avis.note_performance}/5</span>
                                            </div>
                                        </div>
                                    )}
                                    {avis.note_consommation && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Consommation:</span>
                                            <div className="flex items-center space-x-1">
                                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="font-medium">{avis.note_consommation}/5</span>
                                            </div>
                                        </div>
                                    )}
                                    {avis.note_proprete && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Propreté:</span>
                                            <div className="flex items-center space-x-1">
                                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="font-medium">{avis.note_proprete}/5</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Titre et commentaire */}
                            {avis.titre && (
                                <h3 className="font-semibold text-gray-900 mb-2">{avis.titre}</h3>
                            )}
                            {avis.commentaire && (
                                <p className="text-gray-700 mb-4">{avis.commentaire}</p>
                            )}

                            {/* Points positifs/négatifs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {avis.points_positifs && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                            <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-900 mb-1">Points positifs</p>
                                                <p className="text-sm text-green-800">{avis.points_positifs}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {avis.points_negatifs && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                            <FiX className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-900 mb-1">Points à améliorer</p>
                                                <p className="text-sm text-red-800">{avis.points_negatifs}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Réponse du concessionnaire */}
                            {avis.reponse && (
                                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mt-4">
                                    <div className="flex items-start space-x-3">
                                        <FiMessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-blue-900 text-sm mb-1">
                                                Réponse du concessionnaire
                                            </h4>
                                            <p className="text-blue-800 text-sm">{avis.reponse}</p>
                                            {avis.date_reponse && (
                                                <p className="text-xs text-blue-600 mt-2">
                                                    Répondu le {formatDate(avis.date_reponse)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}