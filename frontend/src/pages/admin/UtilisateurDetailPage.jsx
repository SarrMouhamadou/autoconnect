import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUserCheck, FiUserX, FiTrash2, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';

function UtilisateurDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, [id]);

    const loadUser = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUser(id);
            setUser(data);
        } catch (error) {
            console.error('Erreur chargement utilisateur:', error);
            alert('Utilisateur introuvable');
            navigate('/admin/utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleValider = async () => {
        if (!confirm('Valider ce concessionnaire ?')) return;

        try {
            await adminService.validerUser(id);
            alert('✅ Concessionnaire validé');
            loadUser();
        } catch (error) {
            alert('❌ Erreur lors de la validation');
        }
    };

    const handleSuspendre = async () => {
        const raison = prompt('Raison de la suspension :');
        if (!raison) return;

        try {
            await adminService.suspendreUser(id, raison);
            alert('✅ Utilisateur suspendu');
            loadUser();
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    const handleReactiver = async () => {
        if (!confirm('Réactiver cet utilisateur ?')) return;

        try {
            await adminService.reactiverUser(id);
            alert('✅ Utilisateur réactivé');
            loadUser();
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    const handleSupprimer = async () => {
        if (!confirm('⚠️ Supprimer définitivement ? Irréversible !')) return;

        try {
            await adminService.supprimerUser(id);
            alert('✅ Utilisateur supprimé');
            navigate('/admin/utilisateurs');
        } catch (error) {
            alert('❌ Erreur');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Détail utilisateur">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout title="Détail utilisateur">
                <div className="text-center py-12">
                    <p className="text-red-600">Utilisateur introuvable</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Détail utilisateur">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/utilisateurs')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <FiArrowLeft /> Retour à la liste
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {user.prenom} {user.nom}
                        </h1>
                        <p className="text-gray-600 mt-1">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        {!user.est_valide && user.type_utilisateur === 'CONCESSIONNAIRE' && (
                            <button
                                onClick={handleValider}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <FiUserCheck /> Valider
                            </button>
                        )}
                        {user.is_active ? (
                            <button
                                onClick={handleSuspendre}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
                            >
                                <FiUserX /> Suspendre
                            </button>
                        ) : (
                            <button
                                onClick={handleReactiver}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <FiUserCheck /> Réactiver
                            </button>
                        )}
                        <button
                            onClick={handleSupprimer}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                            <FiTrash2 /> Supprimer
                        </button>
                    </div>
                </div>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Carte principale */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="font-medium">{user.type_utilisateur}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Statut</p>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {user.is_active ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium flex items-center gap-2">
                                <FiMail className="text-gray-400" /> {user.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Téléphone</p>
                            <p className="font-medium flex items-center gap-2">
                                <FiPhone className="text-gray-400" /> {user.telephone || 'Non renseigné'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Date d'inscription</p>
                            <p className="font-medium">
                                {new Date(user.date_inscription).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Dernière connexion</p>
                            <p className="font-medium">
                                {user.derniere_connexion
                                    ? new Date(user.derniere_connexion).toLocaleDateString('fr-FR')
                                    : 'Jamais'}
                            </p>
                        </div>
                    </div>

                    {user.type_utilisateur === 'CONCESSIONNAIRE' && (
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="font-semibold mb-2">Validation</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Statut validation</p>
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.est_valide ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {user.est_valide ? 'Validé' : 'En attente'}
                                    </span>
                                </div>
                                {user.date_validation && (
                                    <div>
                                        <p className="text-sm text-gray-600">Date validation</p>
                                        <p className="font-medium">
                                            {new Date(user.date_validation).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistiques */}
                <div className="space-y-6">
                    {user.type_utilisateur === 'CLIENT' && (
                        <>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Locations</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {user.stats?.total_locations || 0}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Dépenses totales</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {(user.stats?.total_depenses || 0).toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                        </>
                    )}

                    {user.type_utilisateur === 'CONCESSIONNAIRE' && (
                        <>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Concessions</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {user.stats?.total_concessions || 0}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Véhicules</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {user.stats?.total_vehicules || 0}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <p className="text-sm text-gray-600">Revenus</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {(user.stats?.total_revenus || 0).toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default UtilisateurDetailPage;