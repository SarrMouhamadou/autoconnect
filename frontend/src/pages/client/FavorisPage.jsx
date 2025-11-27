import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import favoriService from '../../services/favoriService';
import {
    FiHeart, FiBell, FiBellOff, FiEye, FiTrash2,
    FiAlertCircle, FiTrendingDown, FiEdit3
} from 'react-icons/fi';

export default function FavorisPage() {
    const [favoris, setFavoris] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingNotes, setEditingNotes] = useState(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadFavoris();
    }, []);

    const loadFavoris = async () => {
        try {
            setLoading(true);
            const data = await favoriService.getMesFavoris();

            // Extraire le tableau depuis la réponse
            const favorisList = Array.isArray(data)
                ? data
                : (data.results || data.favoris || []);

            setFavoris(favorisList);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAlerte = async (favoriId) => {
        try {
            await favoriService.toggleAlertePrice(favoriId);
            loadFavoris();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRetirerFavori = async (favoriId) => {
        if (window.confirm('Voulez-vous vraiment retirer ce véhicule de vos favoris ?')) {
            try {
                await favoriService.retirerFavori(favoriId);
                loadFavoris();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleSaveNotes = async (favoriId) => {
        try {
            await favoriService.modifierNotes(favoriId, notes);
            setEditingNotes(null);
            setNotes('');
            loadFavoris();
        } catch (err) {
            alert(err.message);
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

    return (
        <DashboardLayout title="Mes favoris">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
                <p className="text-gray-600 mt-1">
                    Gérez vos véhicules favoris et configurez des alertes de prix
                </p>
            </div>

            {/* Statistiques */}
            {!loading && favoris.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total favoris</p>
                                <p className="text-2xl font-bold text-gray-900">{favoris.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <FiHeart className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Alertes actives</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {favoris.filter(f => f.alerte_prix_active).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiBell className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Baisses de prix</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {favoris.filter(f => f.baisse_prix_detectee).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiTrendingDown className="w-6 h-6 text-green-600" />
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
            ) : favoris.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun favori
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Ajoutez des véhicules à vos favoris pour les retrouver facilement
                    </p>
                    <Link
                        to="/vehicules"
                        className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Parcourir les véhicules
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoris.map((favori) => (
                        <div
                            key={favori.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                        >
                            {/* Image */}
                            <div className="relative">
                                <img
                                    src={favori.vehicule.image_principale || 'https://via.placeholder.com/400x250?text=Véhicule'}
                                    alt={favori.vehicule.nom_complet}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x250?text=Véhicule';
                                    }}
                                />

                                {/* Badge baisse de prix */}
                                {favori.baisse_prix_detectee && (
                                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                                        <FiTrendingDown className="w-4 h-4" />
                                        <span>Prix baissé !</span>
                                    </div>
                                )}

                                {/* Bouton retirer */}
                                <button
                                    onClick={() => handleRetirerFavori(favori.id)}
                                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors group"
                                    title="Retirer des favoris"
                                >
                                    <FiTrash2 className="w-5 h-5 text-gray-700 group-hover:text-white" />
                                </button>
                            </div>

                            {/* Contenu */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 truncate">
                                    {favori.vehicule.nom_complet}
                                </h3>

                                {/* Prix */}
                                <div className="mb-3">
                                    {favori.vehicule.prix_location_jour && (
                                        <div className="flex items-baseline space-x-2">
                                            <span className="text-2xl font-bold text-teal-600">
                                                {parseInt(favori.vehicule.prix_location_jour).toLocaleString('fr-FR')} FCFA
                                            </span>
                                            <span className="text-sm text-gray-600">/jour</span>
                                        </div>
                                    )}
                                    {favori.prix_initial && favori.vehicule.prix_location_jour &&
                                        favori.prix_initial !== favori.vehicule.prix_location_jour && (
                                            <div className="flex items-center space-x-2 text-sm">
                                                <span className="text-gray-500 line-through">
                                                    {parseInt(favori.prix_initial).toLocaleString('fr-FR')} FCFA
                                                </span>
                                                <span className="text-green-600 font-medium">
                                                    -{Math.round(((favori.prix_initial - favori.vehicule.prix_location_jour) / favori.prix_initial) * 100)}%
                                                </span>
                                            </div>
                                        )}
                                </div>

                                {/* Date d'ajout */}
                                <p className="text-xs text-gray-500 mb-3">
                                    Ajouté le {formatDate(favori.date_ajout)}
                                </p>

                                {/* Notes */}
                                {editingNotes === favori.id ? (
                                    <div className="mb-3">
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Ajoutez une note..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                            rows="2"
                                        />
                                        <div className="flex items-center space-x-2 mt-2">
                                            <button
                                                onClick={() => handleSaveNotes(favori.id)}
                                                className="flex-1 px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                                            >
                                                Enregistrer
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingNotes(null);
                                                    setNotes('');
                                                }}
                                                className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : favori.notes ? (
                                    <div className="mb-3 bg-gray-50 p-2 rounded text-sm text-gray-700">
                                        <div className="flex items-start justify-between">
                                            <p className="flex-1">{favori.notes}</p>
                                            <button
                                                onClick={() => {
                                                    setEditingNotes(favori.id);
                                                    setNotes(favori.notes);
                                                }}
                                                className="text-teal-600 hover:text-teal-700 ml-2"
                                            >
                                                <FiEdit3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingNotes(favori.id);
                                            setNotes('');
                                        }}
                                        className="text-sm text-gray-500 hover:text-teal-600 mb-3 flex items-center space-x-1"
                                    >
                                        <FiEdit3 className="w-4 h-4" />
                                        <span>Ajouter une note</span>
                                    </button>
                                )}

                                {/* Actions */}
                                <div className="space-y-2">
                                    <Link
                                        to={`/vehicules/${favori.vehicule.id}`}
                                        className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                                    >
                                        <FiEye className="w-4 h-4" />
                                        <span className="text-sm font-medium">Voir le véhicule</span>
                                    </Link>

                                    <button
                                        onClick={() => handleToggleAlerte(favori.id)}
                                        className={`flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg transition ${favori.alerte_prix_active
                                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {favori.alerte_prix_active ? (
                                            <>
                                                <FiBell className="w-4 h-4" />
                                                <span className="text-sm font-medium">Alerte activée</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiBellOff className="w-4 h-4" />
                                                <span className="text-sm font-medium">Activer l'alerte prix</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}