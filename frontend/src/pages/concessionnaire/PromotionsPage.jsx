import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import promotionService from '../../services/promotionService';
import {
    FiTag, FiPercent, FiCalendar, FiClock,
    FiPlus, FiEdit2, FiTrash2, FiAlertCircle,
    FiToggleLeft, FiToggleRight, FiTrendingUp
} from 'react-icons/fi';

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtreStatut, setFiltreStatut] = useState('TOUTES');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        code_promo: '',
        pourcentage_reduction: '',
        date_debut: '',
        date_fin: '',
        est_active: true,
        nombre_utilisations_max: '',
        description: ''
    });

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            setLoading(true);
            const data = await promotionService.getMesPromotions();

            const promotionsArray = Array.isArray(data)
                ? data
                : (data.results || []);

            setPromotions(promotionsArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await promotionService.creerPromotion(formData);
            setShowCreateModal(false);
            resetForm();
            loadPromotions();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleActive = async (promoId, currentStatus) => {
        try {
            await promotionService.togglePromotion(promoId, !currentStatus);
            loadPromotions();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSupprimer = async (promoId) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette promotion ?')) {
            try {
                await promotionService.supprimerPromotion(promoId);
                loadPromotions();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            nom: '',
            code_promo: '',
            pourcentage_reduction: '',
            date_debut: '',
            date_fin: '',
            est_active: true,
            nombre_utilisations_max: '',
            description: ''
        });
    };

    // Filtrer les promotions
    const promotionsFiltrees = Array.isArray(promotions)
        ? promotions.filter(promo => {
            if (filtreStatut === 'TOUTES') return true;
            if (filtreStatut === 'ACTIVES') return promo.est_active;
            if (filtreStatut === 'INACTIVES') return !promo.est_active;
            if (filtreStatut === 'EXPIREES') {
                const maintenant = new Date();
                return new Date(promo.date_fin) < maintenant;
            }
            return true;
        })
        : [];

    // Statistiques
    const stats = {
        total: promotions.length,
        actives: promotions.filter(p => p.est_active).length,
        inactives: promotions.filter(p => !p.est_active).length,
        utilisationsTotal: promotions.reduce((sum, p) => sum + (p.nombre_utilisations || 0), 0),
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatutBadge = (promo) => {
        const maintenant = new Date();
        const dateFin = new Date(promo.date_fin);
        const dateDebut = new Date(promo.date_debut);

        if (dateFin < maintenant) {
            return (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                    Expirée
                </span>
            );
        }

        if (dateDebut > maintenant) {
            return (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    À venir
                </span>
            );
        }

        if (promo.est_active) {
            return (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    <span>Active</span>
                </span>
            );
        }

        return (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                Inactive
            </span>
        );
    };

    return (
        <DashboardLayout title="Mes promotions">
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes promotions</h1>
                        <p className="text-gray-600 mt-1">
                            Créez et gérez vos codes promotionnels
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
                    >
                        <FiPlus className="w-5 h-5" />
                        <span>Nouvelle promotion</span>
                    </button>
                </div>
            </div>

            {/* Statistiques */}
            {!loading && promotions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FiTag className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Actives</p>
                                <p className="text-2xl font-bold text-green-600">{stats.actives}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Inactives</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.inactives}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FiClock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Utilisations</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.utilisationsTotal}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiPercent className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6 overflow-x-auto">
                        {['TOUTES', 'ACTIVES', 'INACTIVES', 'EXPIREES'].map((statut) => (
                            <button
                                key={statut}
                                onClick={() => setFiltreStatut(statut)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${filtreStatut === statut
                                        ? 'border-teal-600 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {statut === 'TOUTES' ? 'Toutes' :
                                    statut === 'ACTIVES' ? 'Actives' :
                                        statut === 'INACTIVES' ? 'Inactives' : 'Expirées'}
                            </button>
                        ))}
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
            ) : promotionsFiltrees.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiTag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune promotion
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Créez votre première promotion pour attirer plus de clients
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        <FiPlus className="w-5 h-5 mr-2" />
                        Créer une promotion
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotionsFiltrees.map((promo) => (
                        <div
                            key={promo.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                        >
                            {/* En-tête coloré */}
                            <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <FiTag className="w-5 h-5" />
                                        <span className="font-semibold">{promo.nom}</span>
                                    </div>
                                    {getStatutBadge(promo)}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-3xl font-bold">{promo.pourcentage_reduction}%</span>
                                    <span className="text-sm opacity-90">de réduction</span>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-4 space-y-3">
                                {/* Code promo */}
                                <div className="bg-gray-50 rounded p-3 text-center">
                                    <p className="text-xs text-gray-600 mb-1">Code promo</p>
                                    <p className="text-lg font-mono font-bold text-gray-900">
                                        {promo.code_promo}
                                    </p>
                                </div>

                                {/* Dates */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <FiCalendar className="w-4 h-4 mr-2" />
                                        <span>Du {formatDate(promo.date_debut)}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FiCalendar className="w-4 h-4 mr-2" />
                                        <span>Au {formatDate(promo.date_fin)}</span>
                                    </div>
                                </div>

                                {/* Statistiques d'utilisation */}
                                <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                                    <span className="text-gray-600">Utilisations</span>
                                    <span className="font-semibold text-gray-900">
                                        {promo.nombre_utilisations || 0}
                                        {promo.nombre_utilisations_max && ` / ${promo.nombre_utilisations_max}`}
                                    </span>
                                </div>

                                {/* Description */}
                                {promo.description && (
                                    <p className="text-sm text-gray-600 pt-3 border-t border-gray-200">
                                        {promo.description}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <button
                                    onClick={() => handleToggleActive(promo.id, promo.est_active)}
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded transition ${promo.est_active
                                            ? 'text-green-600 hover:bg-green-50'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    title={promo.est_active ? 'Désactiver' : 'Activer'}
                                >
                                    {promo.est_active ? (
                                        <FiToggleRight className="w-5 h-5" />
                                    ) : (
                                        <FiToggleLeft className="w-5 h-5" />
                                    )}
                                    <span className="text-sm">
                                        {promo.est_active ? 'Active' : 'Inactive'}
                                    </span>
                                </button>

                                <div className="flex items-center space-x-2">
                                    <button
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                                        title="Modifier"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleSupprimer(promo.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                        title="Supprimer"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Création */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Créer une promotion
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom de la promotion *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Ex: Soldes d'été"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Code promo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code_promo}
                                        onChange={(e) => setFormData({ ...formData, code_promo: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                                        placeholder="Ex: ETE2024"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Réduction (%) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="100"
                                        value={formData.pourcentage_reduction}
                                        onChange={(e) => setFormData({ ...formData, pourcentage_reduction: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Ex: 20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Utilisations max (optionnel)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.nombre_utilisations_max}
                                        onChange={(e) => setFormData({ ...formData, nombre_utilisations_max: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Illimité"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de début *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date_debut}
                                        onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de fin *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date_fin}
                                        onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Description de la promotion (optionnel)"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="est_active"
                                    checked={formData.est_active}
                                    onChange={(e) => setFormData({ ...formData, est_active: e.target.checked })}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <label htmlFor="est_active" className="ml-2 text-sm text-gray-700">
                                    Activer immédiatement cette promotion
                                </label>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                                >
                                    Créer la promotion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}