import { useState, useEffect } from 'react';
import { FiShield, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';

function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [roleForm, setRoleForm] = useState({
        nom: '',
        description: '',
        permissions: []
    });

    useEffect(() => {
        loadRolesEtPermissions();
    }, []);

    const loadRolesEtPermissions = async () => {
        try {
            setLoading(true);
            const [rolesData, permissionsData] = await Promise.all([
                adminService.getAllRoles().catch(() => []),
                adminService.getAllPermissions().catch(() => [])
            ]);

            setRoles(Array.isArray(rolesData) ? rolesData : rolesData.results || []);
            setPermissions(Array.isArray(permissionsData) ? permissionsData : permissionsData.results || []);
        } catch (error) {
            console.error('Erreur chargement rôles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({
                nom: role.nom,
                description: role.description || '',
                permissions: role.permissions || []
            });
        } else {
            setEditingRole(null);
            setRoleForm({ nom: '', description: '', permissions: [] });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRole(null);
        setRoleForm({ nom: '', description: '', permissions: [] });
    };

    const handleTogglePermission = (permissionId) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingRole) {
                await adminService.modifierRole(editingRole.id, roleForm);
                alert('✅ Rôle modifié');
            } else {
                await adminService.creerRole(roleForm);
                alert('✅ Rôle créé');
            }
            handleCloseModal();
            loadRolesEtPermissions();
        } catch (error) {
            alert('❌ Erreur');
            console.error(error);
        }
    };

    const handleDeleteRole = async (id) => {
        if (!confirm('⚠️ Supprimer ce rôle ? Les utilisateurs avec ce rôle perdront leurs permissions.')) return;

        try {
            await adminService.supprimerRole(id); 
            alert('✅ Rôle supprimé');
            loadRolesEtPermissions();
        } catch (error) {
            alert('❌ Erreur : ce rôle est peut-être utilisé');
        }
    };

    return (
        <DashboardLayout title="Rôles & Permissions">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Rôles & Permissions</h1>
                        <p className="text-gray-600 mt-2">Gérer les rôles administrateurs et leurs permissions</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FiPlus /> Nouveau rôle
                    </button>
                </div>
            </div>

            {/* Liste des rôles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                        <p className="text-gray-500">Aucun rôle configuré</p>
                    </div>
                ) : (
                    roles.map((role) => (
                        <div key={role.id} className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FiShield className="text-blue-600 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{role.nom}</h3>
                                        <p className="text-sm text-gray-500">{role.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Permissions :</p>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions?.slice(0, 3).map((perm, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            {permissions.find(p => p.id === perm)?.nom || perm}
                                        </span>
                                    ))}
                                    {role.permissions?.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            +{role.permissions.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(role)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    <FiEdit2 /> Modifier
                                </button>
                                <button
                                    onClick={() => handleDeleteRole(role.id)}
                                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingRole ? 'Modifier le rôle' : 'Nouveau rôle'}
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Nom */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom du rôle *
                                    </label>
                                    <input
                                        type="text"
                                        value={roleForm.nom}
                                        onChange={(e) => setRoleForm({ ...roleForm, nom: e.target.value })}
                                        placeholder="Ex: Modérateur"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                        rows={3}
                                        placeholder="Description du rôle..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Permissions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Permissions *
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                                        <div className="space-y-2">
                                            {permissions.map((permission) => (
                                                <label
                                                    key={permission.id}
                                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={roleForm.permissions.includes(permission.id)}
                                                        onChange={() => handleTogglePermission(permission.id)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {permission.nom}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {permission.description}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {roleForm.permissions.length} permission(s) sélectionnée(s)
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 border-t flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <FiCheck />
                                    {editingRole ? 'Enregistrer' : 'Créer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default RolesPage;