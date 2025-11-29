import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiCheck, FiX, FiEye, FiAlertCircle } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';

function ConcessionsAdminPage() {
    const [concessions, setConcessions] = useState([]);
    const [filteredConcessions, setFilteredConcessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        loadConcessions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterStatus, concessions]);

    const loadConcessions = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllConcessions();
            const concessionsArray = Array.isArray(data) ? data : (data.results || []);
            setConcessions(concessionsArray);
            setFilteredConcessions(concessionsArray);
        } catch (error) {
            console.error('Erreur chargement concessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...concessions];

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par statut
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(c => c.statut === filterStatus);
        }

        setFilteredConcessions(filtered);
    };

    const handleValider = async (id) => {
        if (!confirm('Valider cette concession ?')) return;

        try {
            await adminService.validerConcession(id);
            alert('✅ Concession validée avec succès');
            loadConcessions();
        } catch (error) {
            alert('❌ Erreur lors de la validation');
        }
    };

    const handleRejeter = async (id) => {
        const raison = prompt('Raison du rejet :');
        if (!raison) return;

        try {
            await adminService.rejeterConcession(id, raison);
            alert('✅ Concession rejetée');
            loadConcessions();
        } catch (error) {
            alert('❌ Erreur lors du rejet');
        }
    };

    const handleSuspendre = async (id) => {
        const raison = prompt('Raison de la suspension :');
        if (!raison) return;

        try {
            await adminService.suspendreConcession(id, raison);
            alert('✅ Concession suspendue');
            loadConcessions();
        } catch (error) {
            alert('❌ Erreur lors de la suspension');
        }
    };

    const handleReactiver = async (id) => {
        if (!confirm('Réactiver cette concession ?')) return;

        try {
            await adminService.reactiverConcession(id);
            alert('✅ Concession réactivée');
            loadConcessions();
        } catch (error) {
            alert('❌ Erreur lors de la réactivation');
        }
    };

    return (
        <DashboardLayout title="Gestion des concessions">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des concessions</h1>
                <p className="text-gray-600 mt-2">Valider, modérer et gérer toutes les concessions</p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Total</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{concessions.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Validées</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {concessions.filter(c => c.statut === 'VALIDE').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">En attente</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">
                        {concessions.filter(c => c.statut === 'EN_ATTENTE').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Suspendues</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                        {concessions.filter(c => c.statut === 'SUSPENDUE').length}
                    </p>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recherche */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, ville, adresse..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filtre statut */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="EN_ATTENTE">En attente</option>
                            <option value="VALIDE">Validées</option>
                            <option value="REJETE">Rejetées</option>
                            <option value="SUSPENDUE">Suspendues</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des concessions */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredConcessions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Aucune concession trouvée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Concession
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Propriétaire
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Localisation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date création
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredConcessions.map((concession) => (
                                    <tr key={concession.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {concession.logo ? (
                                                    <img
                                                        src={concession.logo}
                                                        alt={concession.nom}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <FiMapPin className="text-blue-600" />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {concession.nom}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {concession.numero_registre_commerce}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {concession.proprietaire?.prenom} {concession.proprietaire?.nom}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {concession.ville}, {concession.region?.nom}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${concession.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
                                                    concession.statut === 'EN_ATTENTE' ? 'bg-amber-100 text-amber-800' :
                                                        concession.statut === 'REJETE' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {concession.statut === 'VALIDE' && '✅ Validée'}
                                                {concession.statut === 'EN_ATTENTE' && '⏳ En attente'}
                                                {concession.statut === 'REJETE' && '❌ Rejetée'}
                                                {concession.statut === 'SUSPENDUE' && '⛔ Suspendue'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(concession.date_creation).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/concessions/${concession.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Voir détails"
                                                >
                                                    <FiEye className="w-5 h-5" />
                                                </Link>

                                                {concession.statut === 'EN_ATTENTE' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleValider(concession.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Valider"
                                                        >
                                                            <FiCheck className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejeter(concession.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Rejeter"
                                                        >
                                                            <FiX className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {concession.statut === 'VALIDE' && (
                                                    <button
                                                        onClick={() => handleSuspendre(concession.id)}
                                                        className="text-amber-600 hover:text-amber-900"
                                                        title="Suspendre"
                                                    >
                                                        <FiAlertCircle className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {concession.statut === 'SUSPENDUE' && (
                                                    <button
                                                        onClick={() => handleReactiver(concession.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Réactiver"
                                                    >
                                                        <FiCheck className="w-5 h-5" />
                                                    </button>
                                                )}
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

export default ConcessionsAdminPage;