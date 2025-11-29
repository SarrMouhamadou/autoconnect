import { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX, FiAlertTriangle, FiEye } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';

function ModerationAvisPage() {
    const [avis, setAvis] = useState([]);
    const [filteredAvis, setFilteredAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlySignaled, setShowOnlySignaled] = useState(true);

    useEffect(() => {
        loadAvis();
    }, [showOnlySignaled]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, avis]);

    const loadAvis = async () => {
        try {
            setLoading(true);
            const data = showOnlySignaled
                ? await adminService.getAvisSignales()
                : await adminService.getAllAvis();

            const avisArray = Array.isArray(data) ? data : (data.results || []);
            setAvis(avisArray);
            setFilteredAvis(avisArray);
        } catch (error) {
            console.error('Erreur chargement avis:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...avis];

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAvis(filtered);
    };

    const handleApprouver = async (id) => {
        if (!confirm('Approuver cet avis ?')) return;

        try {
            await adminService.modererAvis(id, 'APPROUVER');
            alert('✅ Avis approuvé');
            loadAvis();
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    const handleRejeter = async (id) => {
        const raison = prompt('Raison du rejet :');
        if (!raison) return;

        try {
            await adminService.modererAvis(id, 'REJETER', raison);
            alert('✅ Avis rejeté');
            loadAvis();
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    const handleSupprimer = async (id) => {
        if (!confirm('⚠️ Supprimer définitivement cet avis ?')) return;

        try {
            await adminService.supprimerAvis(id);
            alert('✅ Avis supprimé');
            loadAvis();
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    const renderStars = (note) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= note ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout title="Modération des avis">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Modération des avis</h1>
                <p className="text-gray-600 mt-2">Gérer les avis signalés et inappropriés</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Total avis</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{avis.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Signalés</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                        {avis.filter(a => a.est_signale).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Non validés</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">
                        {avis.filter(a => !a.est_valide).length}
                    </p>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOnlySignaled}
                                onChange={(e) => setShowOnlySignaled(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Afficher uniquement les avis signalés</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Liste */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredAvis.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-500">Aucun avis à modérer</p>
                    </div>
                ) : (
                    filteredAvis.map((avisItem) => (
                        <div key={avisItem.id} className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{avisItem.titre}</h3>
                                        {renderStars(avisItem.note)}
                                        {avisItem.est_signale && (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                                                <FiAlertTriangle /> Signalé
                                            </span>
                                        )}
                                        {!avisItem.est_valide && (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                                Non validé
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">{avisItem.commentaire}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>Par {avisItem.client?.prenom} {avisItem.client?.nom}</span>
                                        <span>•</span>
                                        <span>Véhicule: {avisItem.vehicule?.nom_modele}</span>
                                        <span>•</span>
                                        <span>{new Date(avisItem.date_creation).toLocaleDateString('fr-FR')}</span>
                                    </div>

                                    {avisItem.raison_signalement && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">
                                                <strong>Raison du signalement :</strong> {avisItem.raison_signalement}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    {!avisItem.est_valide && (
                                        <button
                                            onClick={() => handleApprouver(avisItem.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                            title="Approuver"
                                        >
                                            <FiCheck className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRejeter(avisItem.id)}
                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                                        title="Rejeter"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleSupprimer(avisItem.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Supprimer"
                                    >
                                        <FiAlertTriangle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}

export default ModerationAvisPage;