import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';

export default function ProfilePage() {
    const { user, isClient, isConcessionnaire, isAdmin } = useAuth();

    // Format de la date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
                    <p className="mt-2 text-gray-600">
                        Gérez vos informations personnelles et paramètres de compte
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Carte principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations personnelles */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Informations personnelles
                                </h2>
                                <Link
                                    to="/profile/edit"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Modifier
                                </Link>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Prénom
                                        </label>
                                        <p className="text-gray-900">{user?.prenom}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Nom
                                        </label>
                                        <p className="text-gray-900">{user?.nom}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Adresse email
                                    </label>
                                    <p className="text-gray-900">{user?.email}</p>
                                </div>

                                {user?.telephone && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Téléphone
                                        </label>
                                        <p className="text-gray-900">{user.telephone}</p>
                                    </div>
                                )}

                                {(user?.adresse || user?.ville || user?.code_postal) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Adresse
                                        </label>
                                        <p className="text-gray-900">
                                            {user?.adresse && <>{user.adresse}<br /></>}
                                            {user?.code_postal} {user?.ville}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations entreprise (si concessionnaire) */}
                        {isConcessionnaire() && (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Informations entreprise
                                    </h2>
                                </div>
                                <div className="px-6 py-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Nom de l'entreprise
                                        </label>
                                        <p className="text-gray-900">{user?.nom_entreprise}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            SIRET
                                        </label>
                                        <p className="text-gray-900 font-mono">{user?.siret}</p>
                                    </div>

                                    {user?.site_web && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Site web
                                            </label>
                                            <a
                                                href={user.site_web}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                {user.site_web}
                                            </a>
                                        </div>
                                    )}

                                    {user?.description_entreprise && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Description
                                            </label>
                                            <p className="text-gray-900">{user.description_entreprise}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Statut de validation
                                        </label>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user?.est_valide
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {user?.est_valide ? (
                                                <>
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Compte validé
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    En attente de validation
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Informations compte */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Informations du compte
                                </h2>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Type de compte
                                        </label>
                                        <p className="text-gray-900">
                                            {user?.type_utilisateur === 'CLIENT' && '👤 Client'}
                                            {user?.type_utilisateur === 'CONCESSIONNAIRE' && '🏢 Concessionnaire'}
                                            {user?.type_utilisateur === 'ADMINISTRATEUR' && '👨‍💼 Administrateur'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Rôle
                                        </label>
                                        <p className="text-gray-900">{user?.role?.nom}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Date d'inscription
                                        </label>
                                        <p className="text-gray-900">{formatDate(user?.date_inscription)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Dernière connexion
                                        </label>
                                        <p className="text-gray-900">{formatDate(user?.derniere_connexion)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Photo de profil */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Photo de profil
                                </h2>
                            </div>
                            <div className="px-6 py-6 text-center">
                                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                    {user?.photo_profil ? (
                                        <img
                                            src={user.photo_profil}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl text-blue-600 font-bold">
                                            {user?.prenom?.[0]}{user?.nom?.[0]}
                                        </span>
                                    )}
                                </div>
                                <Link
                                    to="/profile/edit"
                                    className="inline-block px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Changer la photo
                                </Link>
                            </div>
                        </div>

                        {/* Actions rapides */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Actions rapides
                                </h2>
                            </div>
                            <div className="px-6 py-4 space-y-2">
                                <Link
                                    to="/profile/edit"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">
                                        Modifier le profil
                                    </span>
                                </Link>

                                <Link
                                    to="/profile/change-password"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">
                                        Changer le mot de passe
                                    </span>
                                </Link>

                                <Link
                                    to="/dashboard"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">
                                        Retour au dashboard
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}


