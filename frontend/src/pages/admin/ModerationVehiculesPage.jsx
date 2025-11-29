import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiCheck, FiX, FiAlertTriangle, FiEye, FiTruck } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';

function ModerationVehiculesPage() {
    const [vehicules, setVehicules] = useState([]);
    const [filteredVehicules, setFilteredVehicules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlySignaled, setShowOnlySignaled] = useState(true);

    useEffect(() => {
        loadVehicules();
    }, [showOnlySignaled]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, vehicules]);

    const loadVehicules = async () => {
        try {
            setLoading(true);
            const data = showOnlySignaled
                ? await adminService.getVehiculesSignales()
                : await adminService.getAllVehicules();

            const vehiculesArray = Array.isArray(data) ? data : (data.results || []);
            setVehicules(vehiculesArray);
            setFilteredVehicules(vehiculesArray);
        } catch (error) {
            console.error('Erreur chargement véhicules:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...vehicules];

        if (searchTerm) {
            filtered = filtered.filter(v =>
                v.nom_modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.marque?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredVehicules(filtered);
    };

    const handleApprouver = async (id) => {
        if (!confirm('Approuver ce véhicule ?')) return;

        try {
            await adminService.modererVehicule(id, 'APPROUVER');
            alert('✅ Véhicule approuvé');
            loadVehicules();
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    const handleRejeter = async (id) => {
        const raison = prompt('Raison du rejet :');
        if (!raison) return;

        try {
            await adminService.modererVehicule(id, 'REJETER', raison);
            alert('✅ Véhicule rejeté');
            loadVehicules();
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    const handleSuspendre = async (id) => {
        const raison = prompt('Raison de la suspension :');
        if (!raison) return;

        try {
            await adminService.modererVehicule(id, 'SUSPENDRE', raison);
            alert('✅ Véhicule suspendu');
            loadVehicules();
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    return (
        <DashboardLayout title="Modération des véhicules">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Modération des véhicules</h1>
                <p className="text-gray-600 mt-2">Gérer les véhicules signalés et vérifier leur conformité</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Total véhicules</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{vehicules.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Signalés</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                        {vehicules.filter(v => v.est_signale).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">En attente validation</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">
                        {vehicules.filter(v => !v.est_valide).length}
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
                            placeholder="Rechercher par modèle, marque, immatriculation..."
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
                            <span className="text-sm text-gray-700">Afficher uniquement les véhicules signalés</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredVehicules.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Aucun véhicule à modérer</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Véhicule
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Concession
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Prix/jour
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Signalement
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredVehicules.map((vehicule) => (
                                    <tr key={vehicule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {vehicule.photos?.[0]?.image ? (
                                                    <img
                                                        src={vehicule.photos[0].image}
                                                        alt={vehicule.nom_modele}
                                                        className="h-12 w-16 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-16 rounded bg-gray-100 flex items-center justify-center">
                                                        <FiTruck className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {vehicule.marque?.nom} {vehicule.nom_modele}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {vehicule.immatriculation}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {vehicule.concession?.nom}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {vehicule.prix_journalier?.toLocaleString('fr-FR')} FCFA
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicule.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                                                        vehicule.statut === 'LOUE' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {vehicule.statut}
                                                </span>
                                                {!vehicule.est_valide && (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                                        Non validé
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {vehicule.est_signale ? (
                                                <div className="text-sm">
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1 w-fit">
                                                        <FiAlertTriangle /> Signalé
                                                    </span>
                                                    {vehicule.raison_signalement && (
                                                        <p className="text-gray-600 mt-1 text-xs">
                                                            {vehicule.raison_signalement}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/vehicules/${vehicule.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Voir détails"
                                                >
                                                    <FiEye className="w-5 h-5" />
                                                </Link>

                                                {!vehicule.est_valide && (
                                                    <button
                                                        onClick={() => handleApprouver(vehicule.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Approuver"
                                                    >
                                                        <FiCheck className="w-5 h-5" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleRejeter(vehicule.id)}
                                                    className="text-amber-600 hover:text-amber-900"
                                                    title="Rejeter"
                                                >
                                                    <FiX className="w-5 h-5" />
                                                </button>

                                                <button
                                                    onClick={() => handleSuspendre(vehicule.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Suspendre"
                                                >
                                                    <FiAlertTriangle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default ModerationVehiculesPage;