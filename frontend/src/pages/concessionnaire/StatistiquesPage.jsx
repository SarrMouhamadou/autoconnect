import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import statistiquesService from '../../services/statistiqueService';
import {
    FiDollarSign, FiTrendingUp, FiCalendar,
    FiUsers, FiStar, FiAlertCircle, FiDownload, FiFilter
} from 'react-icons/fi';

export default function StatistiquesPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periode, setPeriode] = useState('MOIS'); // SEMAINE, MOIS, TRIMESTRE, ANNEE

    useEffect(() => {
        loadStatistiques();
    }, [periode]);

    const loadStatistiques = async () => {
        try {
            setLoading(true);
            const data = await statistiquesService.getDashboardConcessionnaire();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const exporterPDF = () => {
        alert('Export PDF en cours de développement...');
    };

    const KPICard = ({ title, value, icon: Icon, trend, trendValue, color = 'gray' }) => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                {trend && (
                    <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}%
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );

    if (loading) {
        return (
            <DashboardLayout title="Statistiques">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Statistiques">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 mt-2">{error}</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Statistiques">
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
                        <p className="text-gray-600 mt-1">
                            Analyse détaillée de vos performances
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={periode}
                            onChange={(e) => setPeriode(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="SEMAINE">Cette semaine</option>
                            <option value="MOIS">Ce mois</option>
                            <option value="TRIMESTRE">Ce trimestre</option>
                            <option value="ANNEE">Cette année</option>
                        </select>
                        <button
                            onClick={exporterPDF}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
                        >
                            <FiDownload className="w-4 h-4" />
                            <span>Exporter PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="Revenus"
                    value={`${Math.round((stats?.revenus || 0) / 1000)}k FCFA`}
                    icon={FiDollarSign}
                    trend="up"
                    trendValue="12"
                    color="green"
                />
                <KPICard
                    title="Locations"
                    value={stats?.nombreLocations || 0}
                    icon={FiCalendar}
                    trend="up"
                    trendValue="8"
                    color="blue"
                />
                <KPICard
                    title="Taux d'occupation"
                    value={`${stats?.tauxOccupation || 0}%`}
                    icon={FiTrendingUp}
                    trend="down"
                    trendValue="3"
                    color="purple"
                />
                <KPICard
                    title="Note moyenne"
                    value={`${stats?.noteMoyenne || 0}/5`}
                    icon={FiStar}
                    color="yellow"
                />
            </div>

            {/* Statistiques secondaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Véhicules</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total</span>
                            <span className="font-bold">{stats?.vehicules?.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Disponibles</span>
                            <span className="font-bold text-green-600">{stats?.vehicules?.disponibles || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Loués</span>
                            <span className="font-bold text-blue-600">{stats?.vehicules?.loues || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">En maintenance</span>
                            <span className="font-bold text-orange-600">{stats?.vehicules?.maintenance || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Clients</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total</span>
                            <span className="font-bold">{stats?.clients?.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Nouveaux</span>
                            <span className="font-bold text-green-600">{stats?.clients?.nouveaux || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Fidèles</span>
                            <span className="font-bold text-teal-600">{stats?.clients?.fideles || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Actifs</span>
                            <span className="font-bold text-blue-600">{stats?.clients?.actifs || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Demandes</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total</span>
                            <span className="font-bold">{stats?.demandes?.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">En attente</span>
                            <span className="font-bold text-yellow-600">{stats?.demandes?.enAttente || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Traitées</span>
                            <span className="font-bold text-green-600">{stats?.demandes?.traitees || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Taux conversion</span>
                            <span className="font-bold text-purple-600">{stats?.demandes?.tauxConversion || 0}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top véhicules */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Top 5 véhicules les plus loués</h3>
                <div className="space-y-3">
                    {stats?.topVehicules?.map((vehicule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="font-bold text-gray-400">#{index + 1}</span>
                                <div>
                                    <p className="font-medium text-gray-900">{vehicule.nom}</p>
                                    <p className="text-sm text-gray-600">{vehicule.marque} {vehicule.modele}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">{vehicule.nombreLocations} locations</p>
                                <p className="text-sm text-green-600">{vehicule.revenus?.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                        </div>
                    )) || <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>}
                </div>
            </div>

            {/* Graphiques placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Évolution des revenus</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-500">Graphique en cours de développement</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-500">Graphique en cours de développement</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}