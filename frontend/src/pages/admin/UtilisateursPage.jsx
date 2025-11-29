import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiUserCheck, FiUserX, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';

function UtilisateursPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterType, filterStatus, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            const usersArray = Array.isArray(data) ? data : (data.results || []);
            setUsers(usersArray);
            setFilteredUsers(usersArray);
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par type
        if (filterType !== 'ALL') {
            filtered = filtered.filter(user => user.type_utilisateur === filterType);
        }

        // Filtre par statut
        if (filterStatus === 'ACTIVE') {
            filtered = filtered.filter(user => user.is_active);
        } else if (filterStatus === 'INACTIVE') {
            filtered = filtered.filter(user => !user.is_active);
        } else if (filterStatus === 'PENDING') {
            filtered = filtered.filter(user => !user.est_valide && user.type_utilisateur === 'CONCESSIONNAIRE');
        }

        setFilteredUsers(filtered);
    };

    const handleValider = async (userId) => {
        if (!confirm('Valider ce concessionnaire ?')) return;

        try {
            await adminService.validerUser(userId);
            alert('✅ Concessionnaire validé avec succès');
            loadUsers();
        } catch (error) {
            alert('❌ Erreur lors de la validation');
        }
    };

    const handleSuspendre = async (userId) => {
        const raison = prompt('Raison de la suspension :');
        if (!raison) return;

        try {
            await adminService.suspendreUser(userId, raison);
            alert('✅ Utilisateur suspendu');
            loadUsers();
        } catch (error) {
            alert('❌ Erreur lors de la suspension');
        }
    };

    const handleReactiver = async (userId) => {
        if (!confirm('Réactiver cet utilisateur ?')) return;

        try {
            await adminService.reactiverUser(userId);
            alert('✅ Utilisateur réactivé');
            loadUsers();
        } catch (error) {
            alert('❌ Erreur lors de la réactivation');
        }
    };

    const handleSupprimer = async (userId) => {
        if (!confirm('⚠️ ATTENTION : Supprimer définitivement cet utilisateur ? Cette action est irréversible.')) return;

        try {
            await adminService.supprimerUser(userId);
            alert('✅ Utilisateur supprimé');
            loadUsers();
        } catch (error) {
            alert('❌ Erreur lors de la suppression');
        }
    };

    return (
        <DashboardLayout title="Gestion des utilisateurs">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                <p className="text-gray-600 mt-2">Gérer, valider et modérer tous les utilisateurs de la plateforme</p>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Total utilisateurs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Clients</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        {users.filter(u => u.type_utilisateur === 'CLIENT').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">Concessionnaires</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {users.filter(u => u.type_utilisateur === 'CONCESSIONNAIRE').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm">En attente</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">
                        {users.filter(u => !u.est_valide && u.type_utilisateur === 'CONCESSIONNAIRE').length}
                    </p>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Recherche */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filtre type */}
                    <div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">Tous les types</option>
                            <option value="CLIENT">Clients</option>
                            <option value="CONCESSIONNAIRE">Concessionnaires</option>
                            <option value="ADMIN">Administrateurs</option>
                        </select>
                    </div>

                    {/* Filtre statut */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="ACTIVE">Actifs</option>
                            <option value="INACTIVE">Inactifs</option>
                            <option value="PENDING">En attente</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Aucun utilisateur trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Utilisateur
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date inscription
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium">
                                                            {user.prenom?.[0]}{user.nom?.[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.prenom} {user.nom}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.type_utilisateur === 'CLIENT' ? 'bg-blue-100 text-blue-800' :
                                                    user.type_utilisateur === 'CONCESSIONNAIRE' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                                }`}>
                                                {user.type_utilisateur}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                                {!user.est_valide && user.type_utilisateur === 'CONCESSIONNAIRE' && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                                        En attente
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.date_inscription).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/utilisateurs/${user.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Voir détails"
                                                >
                                                    <FiEye className="w-5 h-5" />
                                                </Link>

                                                {!user.est_valide && user.type_utilisateur === 'CONCESSIONNAIRE' && (
                                                    <button
                                                        onClick={() => handleValider(user.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Valider"
                                                    >
                                                        <FiUserCheck className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {user.is_active ? (
                                                    <button
                                                        onClick={() => handleSuspendre(user.id)}
                                                        className="text-amber-600 hover:text-amber-900"
                                                        title="Suspendre"
                                                    >
                                                        <FiUserX className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactiver(user.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Réactiver"
                                                    >
                                                        <FiUserCheck className="w-5 h-5" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleSupprimer(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Supprimer"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
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

export default UtilisateursPage;