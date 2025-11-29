import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import avisService from '../../services/avisService';
import {
    FiStar, FiMessageSquare, FiCheck, FiAlertCircle,
    FiThumbsUp, FiThumbsDown, FiFilter, FiTrendingUp
} from 'react-icons/fi';

export default function AvisPage() {
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtreNote, setFiltreNote] = useState('TOUS');
    const [filtreStatut, setFiltreStatut] = useState('TOUS');
    const [selectedAvis, setSelectedAvis] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseText, setResponseText] = useState('');

    useEffect(() => {
        loadAvis();
    }, []);

    const loadAvis = async () => {
        try {
            setLoading(true);
            const data = await avisService.getAvisRecus();

            // ✅ GESTION PAGINATION (comme LocationsPage)
            if (data && data.results) {
                setAvis(data.results);  // Réponse paginée
            } else if (Array.isArray(data)) {
                setAvis(data);  // Réponse directe
            } else {
                setAvis([]);
            }
        } catch (err) {
            setError(err.message);
            setAvis([]);  // Important pour éviter l'erreur filter
        } finally {
            setLoading(false);
        }
    };

    const handleRepondre = (avisItem) => {
        setSelectedAvis(avisItem);
        setResponseText(avisItem.reponse || '');
        setShowResponseModal(true);
    };

    const handleSubmitResponse = async () => {
        if (!responseText.trim()) {
            alert('Veuillez saisir une réponse');
            return;
        }

        try {
            await avisService.repondreAvis(selectedAvis.id, responseText);
            setShowResponseModal(false);
            setResponseText('');
            setSelectedAvis(null);
            loadAvis();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSignaler = async (avisId) => {
        if (window.confirm('Voulez-vous vraiment signaler cet avis ?')) {
            try {
                await avisService.signalerAvis(avisId);
                loadAvis();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    // Filtrer les avis
    const avisFiltres = Array.isArray(avis)
        ? avis.filter(a => {
            const matchNote = filtreNote === 'TOUS' || a.note === parseInt(filtreNote);
            const matchStatut = filtreStatut === 'TOUS' ||
                (filtreStatut === 'AVEC_REPONSE' && a.reponse) ||
                (filtreStatut === 'SANS_REPONSE' && !a.reponse) ||
                (filtreStatut === 'SIGNALES' && a.est_signale);
            return matchNote && matchStatut;
        })
        : [];

    // Statistiques
    const stats = {
        total: avis.length,
        noteMoyenne: avis.length > 0
            ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1)
            : 0,
        avecReponse: avis.filter(a => a.reponse).length,
        sansReponse: avis.filter(a => !a.reponse).length,
        signales: avis.filter(a => a.est_signale).length,
        recommandations: avis.filter(a => a.recommande).length,
    };

    // Distribution par note
    const distribution = {
        5: avis.filter(a => a.note === 5).length,
        4: avis.filter(a => a.note === 4).length,
        3: avis.filter(a => a.note === 3).length,
        2: avis.filter(a => a.note === 2).length,
        1: avis.filter(a => a.note === 1).length,
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

    const getNoteBadge = (note) => {
        const config = {
            5: { bg: 'bg-green-100', text: 'text-green-800' },
            4: { bg: 'bg-blue-100', text: 'text-blue-800' },
            3: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            2: { bg: 'bg-orange-100', text: 'text-orange-800' },
            1: { bg: 'bg-red-100', text: 'text-red-800' },
        };

        const { bg, text } = config[note] || config[3];

        return (
            <span className={`px-2 py-1 ${bg} ${text} text-xs font-medium rounded`}>
                {note}/5
            </span>
        );
    };

    return (
        <DashboardLayout title="Avis reçus">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Avis reçus</h1>
                <p className="text-gray-600 mt-1">
                    Consultez et répondez aux avis de vos clients
                </p>
            </div>

            {/* Statistiques */}
            {!loading && avis.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FiMessageSquare className="w-6 h-6 text-gray-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Note moyenne</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-bold text-yellow-600">{stats.noteMoyenne}</p>
                                        <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <FiTrendingUp className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avec réponse</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.avecReponse}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FiCheck className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Sans réponse</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.sansReponse}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FiMessageSquare className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Recommandent</p>
                                    <p className="text-2xl font-bold text-teal-600">{stats.recommandations}</p>
                                </div>
                                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <FiThumbsUp className="w-6 h-6 text-teal-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Signalés</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.signales}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FiAlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Distribution des notes */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Distribution des notes
                        </h2>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(note => {
                                const count = distribution[note];
                                const percentage = avis.length > 0 ? (count / avis.length) * 100 : 0;

                                return (
                                    <div key={note} className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 w-20">
                                            <span className="text-sm font-medium text-gray-900">{note}</span>
                                            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-16 text-right">
                                            {count} ({Math.round(percentage)}%)
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-gray-700">
                        <FiFilter className="w-5 h-5" />
                        <span className="font-medium">Filtres</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note
                            </label>
                            <select
                                value={filtreNote}
                                onChange={(e) => setFiltreNote(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="TOUS">Toutes les notes</option>
                                <option value="5">5 étoiles</option>
                                <option value="4">4 étoiles</option>
                                <option value="3">3 étoiles</option>
                                <option value="2">2 étoiles</option>
                                <option value="1">1 étoile</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                value={filtreStatut}
                                onChange={(e) => setFiltreStatut(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="TOUS">Tous</option>
                                <option value="AVEC_REPONSE">Avec réponse</option>
                                <option value="SANS_REPONSE">Sans réponse</option>
                                <option value="SIGNALES">Signalés</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

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
            ) : avisFiltres.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiStar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun avis
                    </h3>
                    <p className="text-gray-600">
                        Aucun avis ne correspond aux filtres sélectionnés
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {avisFiltres.map((avisItem) => (
                        <div
                            key={avisItem.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                        >
                            {/* En-tête */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Link
                                            to={`/concessionnaire/vehicules/${avisItem.vehicule?.id}`}
                                            className="text-lg font-semibold text-gray-900 hover:text-teal-600"
                                        >
                                            {avisItem.vehicule?.nom_complet}
                                        </Link>
                                        {getNoteBadge(avisItem.note)}
                                        {avisItem.recommande && (
                                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded">
                                                <FiThumbsUp className="w-3 h-3" />
                                                <span>Recommandé</span>
                                            </span>
                                        )}
                                        {avisItem.est_signale && (
                                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                                <FiAlertCircle className="w-3 h-3" />
                                                <span>Signalé</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>Par {avisItem.client?.nom_complet || 'Client anonyme'}</span>
                                        <span>•</span>
                                        <span>{formatDate(avisItem.date_creation)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {!avisItem.reponse && (
                                        <button
                                            onClick={() => handleRepondre(avisItem)}
                                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm"
                                        >
                                            Répondre
                                        </button>
                                    )}
                                    {!avisItem.est_signale && (
                                        <button
                                            onClick={() => handleSignaler(avisItem.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Signaler cet avis"
                                        >
                                            <FiAlertCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Note et étoiles */}
                            <div className="mb-4">
                                {renderStars(avisItem.note)}
                            </div>

                            {/* Notes détaillées */}
                            {(avisItem.note_confort || avisItem.note_performance ||
                                avisItem.note_consommation || avisItem.note_proprete) && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                        {avisItem.note_confort && (
                                            <div className="text-sm">
                                                <span className="text-gray-600">Confort:</span>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="font-medium">{avisItem.note_confort}/5</span>
                                                </div>
                                            </div>
                                        )}
                                        {avisItem.note_performance && (
                                            <div className="text-sm">
                                                <span className="text-gray-600">Performance:</span>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="font-medium">{avisItem.note_performance}/5</span>
                                                </div>
                                            </div>
                                        )}
                                        {avisItem.note_consommation && (
                                            <div className="text-sm">
                                                <span className="text-gray-600">Consommation:</span>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="font-medium">{avisItem.note_consommation}/5</span>
                                                </div>
                                            </div>
                                        )}
                                        {avisItem.note_proprete && (
                                            <div className="text-sm">
                                                <span className="text-gray-600">Propreté:</span>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="font-medium">{avisItem.note_proprete}/5</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* Titre et commentaire */}
                            {avisItem.titre && (
                                <h3 className="font-semibold text-gray-900 mb-2">{avisItem.titre}</h3>
                            )}
                            {avisItem.commentaire && (
                                <p className="text-gray-700 mb-4">{avisItem.commentaire}</p>
                            )}

                            {/* Points positifs/négatifs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {avisItem.points_positifs && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                            <FiThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-900 mb-1">Points positifs</p>
                                                <p className="text-sm text-green-800">{avisItem.points_positifs}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {avisItem.points_negatifs && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                            <FiThumbsDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-900 mb-1">Points à améliorer</p>
                                                <p className="text-sm text-red-800">{avisItem.points_negatifs}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Réponse du concessionnaire */}
                            {avisItem.reponse && (
                                <div className="bg-teal-50 border-l-4 border-teal-600 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-teal-900 mb-2">Votre réponse :</h4>
                                            <p className="text-teal-800 text-sm">{avisItem.reponse}</p>
                                            {avisItem.date_reponse && (
                                                <p className="text-xs text-teal-600 mt-2">
                                                    Répondu le {formatDate(avisItem.date_reponse)}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRepondre(avisItem)}
                                            className="ml-4 text-teal-600 hover:text-teal-700 text-sm font-medium"
                                        >
                                            Modifier
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Réponse */}
            {showResponseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedAvis?.reponse ? 'Modifier votre réponse' : 'Répondre à l\'avis'}
                            </h3>
                        </div>

                        <div className="p-6">
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    {renderStars(selectedAvis?.note)}
                                    <span className="text-sm text-gray-600">
                                        par {selectedAvis?.client?.nom_complet}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">{selectedAvis?.commentaire}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Votre réponse
                                </label>
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Répondez de manière professionnelle et constructive..."
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 Astuce : Remerciez le client, adressez ses préoccupations et proposez des améliorations.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowResponseModal(false);
                                    setResponseText('');
                                    setSelectedAvis(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmitResponse}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                            >
                                {selectedAvis?.reponse ? 'Modifier la réponse' : 'Publier la réponse'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}