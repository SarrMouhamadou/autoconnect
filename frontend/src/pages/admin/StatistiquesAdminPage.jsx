import { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp, FiUsers, FiTruck, FiDollarSign, FiCalendar } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RevenueChart from '../../components/dashboard/RevenueChart';
import statistiqueService from '../../services/statistiqueService';

function StatistiquesAdminPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periode, setPeriode] = useState('mois'); // jour, semaine, mois, annee
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');

    useEffect(() => {
        loadStatistiques();
    }, [periode]);

    const loadStatistiques = async () => {
        try {
            setLoading(true);
            const data = await statistiqueService.getDashboardAdmin();
            setStats(data);
        } catch (error) {
            console.error('Erreur chargement statistiques:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const params = {
                format, // 'pdf' ou 'excel'
                periode,
                date_debut: dateDebut,
                date_fin: dateFin
            };

            // Appeler l'API d'export
            const blob = await statistiqueService.exportStatistiques(params);

            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `statistiques_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('✅ Export réussi');
        } catch (error) {
            alert('❌ Erreur lors de l\'export');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Statistiques">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Statistiques">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Statistiques globales</h1>
                        <p className="text-gray-600 mt-2">Rapports détaillés de la plateforme</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('pdf')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                            <FiDownload /> Export PDF
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <FiDownload /> Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtres de période */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                        <select
                            value={periode}
                            onChange={(e) => setPeriode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="jour">Aujourd'hui</option>
                            <option value="semaine">Cette semaine</option>
                            <option value="mois">Ce mois</option>
                            <option value="annee">Cette année</option>
                            <option value="custom">Personnalisée</option>
                        </select>
                    </div>

                    {periode === 'custom' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                                <input
                                    type="date"
                                    value={dateDebut}
                                    onChange={(e) => setDateDebut(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                                <input
                                    type="date"
                                    value={dateFin}
                                    onChange={(e) => setDateFin(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={loadStatistiques}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Appliquer
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* KPIs globaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-sm">Total Utilisateurs</p>
                        <FiUsers className="text-blue-600 text-2xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats?.utilisateurs?.total || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {stats?.utilisateurs?.nouveaux_ce_mois || 0} ce mois
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-sm">Concessions</p>
                        <FiTruck className="text-green-600 text-2xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats?.concessions?.total || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {stats?.concessions?.actives || 0} actives
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-sm">Véhicules</p>
                        <FiTruck className="text-purple-600 text-2xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats?.vehicules?.total || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {stats?.vehicules?.disponibles || 0} disponibles
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-sm">Revenus totaux</p>
                        <FiDollarSign className="text-amber-600 text-2xl" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {(stats?.revenus?.total || 0).toLocaleString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">FCFA</p>
                </div>
            </div>

            {/* Graphique des revenus */}
            {stats?.tendances?.revenus && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Évolution des revenus</h2>
                    <RevenueChart data={stats.tendances.revenus} />
                </div>
            )}

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Locations */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Locations</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total</span>
                            <span className="font-semibold text-gray-900">{stats?.locations?.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">En cours</span>
                            <span className="font-semibold text-blue-600">{stats?.locations?.en_cours || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Terminées</span>
                            <span className="font-semibold text-green-600">{stats?.locations?.terminees || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Annulées</span>
                            <span className="font-semibold text-red-600">{stats?.locations?.annulees || 0}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                            <span className="text-gray-600">Taux de réussite</span>
                            <span className="font-semibold text-gray-900">
                                {stats?.locations?.taux_reussite || 0}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top régions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Top régions</h2>
                    <div className="space-y-3">
                        {stats?.top_regions?.map((region, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                                    <span className="text-gray-900">{region.nom}</span>
                                </div>
                                <span className="font-semibold text-blue-600">{region.locations}</span>
                            </div>
                        )) || <p className="text-gray-500 text-center py-4">Aucune donnée</p>}
                    </div>
                </div>
            </div>

            {/* Top véhicules et Top concessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top véhicules */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Top véhicules loués</h2>
                    <div className="space-y-3">
                        {stats?.top_vehicules?.map((vehicule, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                                    <span className="text-gray-900">{vehicule.nom}</span>
                                </div>
                                <span className="font-semibold text-green-600">{vehicule.locations}</span>
                            </div>
                        )) || <p className="text-gray-500 text-center py-4">Aucune donnée</p>}
                    </div>
                </div>

                {/* Top concessions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Top concessions</h2>
                    <div className="space-y-3">
                        {stats?.top_concessions?.map((concession, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                                    <span className="text-gray-900">{concession.nom}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                        {(concession.revenus || 0).toLocaleString('fr-FR')} FCFA
                                    </p>
                                    <p className="text-sm text-gray-500">{concession.locations} locations</p>
                                </div>
                            </div>
                        )) || <p className="text-gray-500 text-center py-4">Aucune donnée</p>}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default StatistiquesAdminPage;