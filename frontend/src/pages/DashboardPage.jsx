import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProfileCompletionBanner from '../components/profile/ProfileCompletionBanner';  // ← AJOUTER
import authService from '../services/authService';

export default function DashboardPage() {
  const { user, isClient, isConcessionnaire, isAdmin } = useAuth();


  // État pour la progression du profil
  const [profileProgress, setProfileProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Charger la progression au montage
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoadingProgress(true);
        const progress = await authService.getProfileProgress();
        setProfileProgress(progress);
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, []);

  // Déterminer le message de bienvenue selon le type
  const getWelcomeMessage = () => {
    if (isClient()) {
      return "Bienvenue dans votre espace client";
    } else if (isConcessionnaire()) {
      return "Bienvenue dans votre espace concessionnaire";
    } else if (isAdmin()) {
      return "Bienvenue dans l'administration";
    }
    return "Bienvenue";
  };

  // Icône selon le type
  const getIcon = () => {
    if (isClient()) return "👤";
    if (isConcessionnaire()) return "🏢";
    if (isAdmin()) return "👨‍💼";
    return "🚗";
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


        {/* Bannière de complétion du profil */}
        {!loadingProgress && (
          <ProfileCompletionBanner user={user} progress={profileProgress} />
        )}

        {/* Badge de validation pour concessionnaire validé */}
        {isConcessionnaire() && user?.statut_compte === 'VALIDE' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  ✅ Votre compte est validé !
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  <p>
                    Félicitations ! Vous pouvez maintenant ajouter vos véhicules et gérer vos locations.
                  </p>
                </div>
                <div className="mt-3">
                  <Link
                    to="/my-vehicles"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none transition"
                  >
                    Ajouter mon premier véhicule →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Carte de bienvenue */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{getIcon()}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {getWelcomeMessage()}
            </h2>
            <p className="text-xl text-gray-600">
              Bonjour {user?.prenom} {user?.nom} !
            </p>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte Profil */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Informations personnelles
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Type de compte:</span>
                <p className="text-gray-900">
                  {user?.type_utilisateur === 'CLIENT' && '👤 Client'}
                  {user?.type_utilisateur === 'CONCESSIONNAIRE' && '🏢 Concessionnaire'}
                  {user?.type_utilisateur === 'ADMINISTRATEUR' && '👨‍💼 Administrateur'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Rôle:</span>
                <p className="text-gray-900">{user?.role?.nom}</p>
              </div>
              {user?.telephone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Téléphone:</span>
                  <p className="text-gray-900">{user.telephone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Carte Entreprise (si concessionnaire) */}
          {isConcessionnaire() && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🏢 Informations entreprise
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Entreprise:</span>
                  <p className="text-gray-900">{user?.nom_entreprise}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">SIRET:</span>
                  <p className="text-gray-900">{user?.siret}</p>
                </div>
                {user?.site_web && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Site web:</span>
                    <a
                      href={user.site_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {user.site_web}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Statut:</span>
                  <p className={`font-medium ${user?.est_valide ? 'text-green-600' : 'text-orange-600'}`}>
                    {user?.est_valide ? '✅ Validé' : '⏳ En attente de validation'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Carte Actions rapides */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚡ Actions rapides
            </h3>
            <div className="space-y-3">
              <Link
                to="/profile"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
              >
                📋 Voir mon profil
              </Link>
              <Link
                to="/profile/edit"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
              >
                📝 Modifier mon profil
              </Link>
              <Link
                to="/profile/change-password"
                className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
              >
                🔒 Changer mon mot de passe
              </Link>
              {isClient() && (
                <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition">
                  🚗 Rechercher un véhicule (Bientôt)
                </button>
              )}
              {isConcessionnaire() && (
                <>
                  <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition">
                    ➕ Ajouter un véhicule (Bientôt)
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition">
                    📊 Voir mes statistiques (Bientôt)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Carte Statistiques */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {isClient() && (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Locations actives</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Locations terminées</div>
                  </div>
                </>
              )}
              {isConcessionnaire() && (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Véhicules</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Locations actives</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0 FCFA</div>
                    <div className="text-sm text-gray-600">Revenus ce mois</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Demandes en attente</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Message informatif */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-2xl mr-3">ℹ️</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Tableau de bord temporaire
              </h4>
              <p className="text-sm text-blue-700">
                Cette page est une version basique pour tester l'authentification.
                Les fonctionnalités complètes seront ajoutées dans les prochaines phases du projet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
