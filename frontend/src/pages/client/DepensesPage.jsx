import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import locationService from '../../services/locationService';
import {
    FiDollarSign, FiTrendingUp, FiCalendar, FiDownload,
    FiAlertCircle, FiPieChart
} from 'react-icons/fi';

export default function DepensesPage() {
    const [locations, setLocations] = useState([]);
    const [statistiques, setStatistiques] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periode, setPeriode] = useState('ANNEE'); // MOIS, TRIMESTRE, ANNEE, TOUT

    useEffect(() => {
        loadData();
    }, [periode]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await locationService.getMesLocations();

            // Extraire le tableau
            const locationsArray = Array.isArray(data)
                ? data
                : (data.results || []);

            // Filtrer par période
            const maintenant = new Date();
            const locationsFiltrees = locationsArray.filter(location => {
                const dateDebut = new Date(location.date_debut);

                if (periode === 'MOIS') {
                    return dateDebut.getMonth() === maintenant.getMonth() &&
                        dateDebut.getFullYear() === maintenant.getFullYear();
                } else if (periode === 'TRIMESTRE') {
                    const trimestre = Math.floor(maintenant.getMonth() / 3);
                    const trimestreLocation = Math.floor(dateDebut.getMonth() / 3);
                    return trimestreLocation === trimestre &&
                        dateDebut.getFullYear() === maintenant.getFullYear();
                } else if (periode === 'ANNEE') {
                    return dateDebut.getFullYear() === maintenant.getFullYear();
                }
                return true; // TOUT
            });

            setLocations(locationsFiltrees);
            calculerStatistiques(locationsFiltrees);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculerStatistiques = (locationsData) => {
        const total = locationsData.reduce((sum, loc) => sum + parseFloat(loc.prix_total || 0), 0);
        const caution = locationsData.reduce((sum, loc) => sum + parseFloat(loc.caution || 0), 0);
        const moyenne = locationsData.length > 0 ? total / locationsData.length : 0;

        // Grouper par mois
        const parMois = {};
        locationsData.forEach(loc => {
            const date = new Date(loc.date_debut);
            const mois = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            if (!parMois[mois]) {
                parMois[mois] = { count: 0, total: 0 };
            }
            parMois[mois].count++;
            parMois[mois].total += parseFloat(loc.prix_total || 0);
        });

        setStatistiques({
            total,
            caution,
            moyenne,
            nombre_locations: locationsData.length,
            par_mois: parMois
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const exporterCSV = () => {
        const headers = ['Date début', 'Date fin', 'Véhicule', 'Durée (jours)', 'Prix total', 'Statut'];
        const rows = locations.map(loc => [
            formatDate(loc.date_debut),
            formatDate(loc.date_fin),
            loc.vehicule?.nom_complet || '',
            loc.duree_location,
            loc.prix_total,
            loc.statut
        ]);

        const csv = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `depenses_${periode.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <DashboardLayout title="Mes dépenses">
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes dépenses</h1>
                        <p className="text-gray-600 mt-1">
                            Suivez vos dépenses de location
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Sélecteur de période */}
                        <select
                            value={periode}
                            onChange={(e) => setPeriode(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="MOIS">Ce mois</option>
                            <option value="TRIMESTRE">Ce trimestre</option>
                            <option value="ANNEE">Cette année</option>
                            <option value="TOUT">Tout</option>
                        </select>

                        {locations.length > 0 && (
                            <button
                                onClick={exporterCSV}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
                            >
                                <FiDownload className="w-4 h-4" />
                                <span>Exporter CSV</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            {!loading && statistiques && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <FiDollarSign className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Total dépensé</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {Math.round(statistiques.total).toLocaleString('fr-FR')} FCFA
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiCalendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Nombre de locations</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {statistiques.nombre_locations}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Dépense moyenne</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {Math.round(statistiques.moyenne).toLocaleString('fr-FR')} FCFA
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FiPieChart className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Caution totale</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {Math.round(statistiques.caution).toLocaleString('fr-FR')} FCFA
                        </p>
                    </div>
                </div>
            )}

            {/* Répartition par mois */}
            {!loading && statistiques && Object.keys(statistiques.par_mois).length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Répartition par mois
                    </h2>
                    <div className="space-y-3">
                        {Object.entries(statistiques.par_mois).map(([mois, data]) => (
                            <div key={mois} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900">{mois}</span>
                                        <span className="text-sm text-gray-600">
                                            {data.count} location{data.count > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-teal-600 h-2 rounded-full"
                                            style={{
                                                width: `${(data.total / statistiques.total) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="ml-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                    {Math.round(data.total).toLocaleString('fr-FR')} FCFA
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Liste des dépenses */}
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
            ) : locations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune dépense pour cette période
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Vos dépenses de location apparaîtront ici
                    </p>
                    <Link
                        to="/vehicules"
                        className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Louer un véhicule
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Véhicule
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Durée
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Caution
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {locations.map((location) => (
                                    <tr key={location.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(location.date_debut)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {location.vehicule?.nom_complet}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {location.concession?.nom}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {location.duree_location} jour{location.duree_location > 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {Math.round(location.caution).toLocaleString('fr-FR')} FCFA
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {Math.round(location.prix_total).toLocaleString('fr-FR')} FCFA
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${location.statut === 'TERMINEE' ? 'bg-green-100 text-green-800' :
                                                location.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                                                    location.statut === 'CONFIRMEE' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {location.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/client/locations/${location.id}`}
                                                className="text-teal-600 hover:text-teal-900"
                                            >
                                                Voir détails
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}