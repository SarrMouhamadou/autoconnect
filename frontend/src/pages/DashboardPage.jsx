import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import { FaCar } from "react-icons/fa";

import {
  FiCalendar, FiDollarSign, FiTrendingUp, FiUsers,
  FiMapPin, FiAlertCircle, FiMessageSquare, FiClock,
  FiStar, FiBell, FiFileText, FiSettings, FiHelpCircle,
  FiChevronRight, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';

import locationService from '../services/locationService';
import vehiculeService from '../services/vehiculeService';
import statistiqueService from '../services/statistiqueService';
import historiqueService from '../services/historiqueService';
import notificationService from '../services/notificationService';
import favoriService from '../services/favoriService';

export default function DashboardPage() {
  const { user, isClient, isConcessionnaire, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isClient()) {
      loadClientDashboard();
    } else {
      loadDashboardData();
    }
  }, [user]);

  const loadClientDashboard = async () => {
    try {
      setLoading(true);

      // Charger toutes les données en parallèle
      const [
        locationsData,
        statsData,
        historiqueData,
        notificationsData,
        favorisData
      ] = await Promise.all([
        locationService.getMesLocations().catch(() => ({ results: [] })),
        statistiqueService.getDashboardClient().catch(() => ({})),
        historiqueService.getHistoriqueRecent().catch(() => []),
        notificationService.getMesNotifications().catch(() => []),
        favoriService.getMesFavoris().catch(() => [])
      ]);

      // Extraire les tableaux
      const locations = Array.isArray(locationsData)
        ? locationsData
        : (locationsData.results || []);

      const historique = Array.isArray(historiqueData)
        ? historiqueData
        : (historiqueData.results || []);

      const notifications = Array.isArray(notificationsData)
        ? notificationsData
        : (notificationsData.results || []);

      const favoris = Array.isArray(favorisData)
        ? favorisData
        : (favorisData.results || []);

      // Calculer les statistiques
      const locationsEnCours = locations.filter(l => l.statut === 'EN_COURS');
      const locationsAVenir = locations.filter(l => l.statut === 'CONFIRMEE');
      const montantTotal = locations.reduce((sum, l) => sum + parseFloat(l.prix_total || 0), 0);
      const notificationsNonLues = notifications.filter(n => !n.lue);

      // Préparer les alertes
      const newAlerts = [];

      // Alerte locations qui se terminent bientôt
      locationsEnCours.forEach(location => {
        if (location.date_fin) {
          const dateFin = new Date(location.date_fin);
          const now = new Date();
          const diffJours = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));

          if (diffJours <= 2 && diffJours > 0) {
            newAlerts.push({
              type: 'warning',
              icon: FiClock,
              title: 'Location qui se termine bientôt',
              message: `Votre location "${location.vehicule?.nom_complet}" se termine dans ${diffJours} jour${diffJours > 1 ? 's' : ''}`,
              link: `/client/locations/${location.id}`
            });
          }
        }
      });

      // Alerte baisses de prix sur favoris
      const favorisAvecBaisse = favoris.filter(f => f.baisse_prix_detectee);
      if (favorisAvecBaisse.length > 0) {
        newAlerts.push({
          type: 'success',
          icon: FiTrendingUp,
          title: `Baisse de prix sur ${favorisAvecBaisse.length} favori${favorisAvecBaisse.length > 1 ? 's' : ''}`,
          message: 'Des véhicules dans vos favoris ont vu leur prix baisser !',
          link: '/client/favoris'
        });
      }

      // Alerte notifications non lues
      if (notificationsNonLues.length > 0) {
        newAlerts.push({
          type: 'info',
          icon: FiBell,
          title: `${notificationsNonLues.length} notification${notificationsNonLues.length > 1 ? 's' : ''} non lue${notificationsNonLues.length > 1 ? 's' : ''}`,
          message: 'Vous avez de nouvelles notifications à consulter',
          link: '/client/notifications'
        });
      }

      setStats({
        totalLocations: locations.length,
        locationsEnCours: locationsEnCours.length,
        locationsAVenir: locationsAVenir.length,
        montantTotal,
        totalFavoris: favoris.length,
        demandesEnAttente: statsData?.demandes?.en_attente || 0,
        avisPublies: statsData?.avis?.publies || 0,
        notificationsNonLues: notificationsNonLues.length,
        actionsRecentes: historiqueData?.length || 0,
        ...statsData
      });

      setRecentActivity(historique.slice(0, 5));
      setAlerts(newAlerts);

      // Recommandations simples basées sur l'activité
      if (historique.length > 0) {
        setRecommendations([
          {
            title: 'Basé sur vos consultations',
            description: 'Découvrez des véhicules similaires',
            link: '/vehicules'
          }
        ]);
      }

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isConcessionnaire()) {
        const [vehiculesData, statsData] = await Promise.all([
          vehiculeService.getMesVehicules(),
          statistiqueService.getDashboardConcessionnaire()
        ]);

        const vehicules = Array.isArray(vehiculesData)
          ? vehiculesData
          : (vehiculesData.results || []);

        setStats({
          totalVehicules: vehicules.length,
          vehiculesDisponibles: vehicules.filter(v => v.statut === 'DISPONIBLE').length,
          locationsActives: statsData?.locations?.en_cours || 0,
          revenusTotal: statsData?.revenus?.total || 0,
          ...statsData
        });

      } else if (isAdmin()) {
        const statsData = await statistiqueService.getDashboardAdmin();
        setStats(statsData);
      }

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater les dates relatives
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Icônes pour les types d'actions
  const getActionIcon = (typeAction) => {
    const icons = {
      CONSULTATION_VEHICULE: { icon: FiCar, color: 'text-blue-600' },
      AJOUT_FAVORI: { icon: FiStar, color: 'text-yellow-600' },
      DEMANDE_CONTACT: { icon: FiMessageSquare, color: 'text-purple-600' },
      RESERVATION: { icon: FiCalendar, color: 'text-green-600' }
    };
    return icons[typeAction] || { icon: FiFileText, color: 'text-gray-600' };
  };

  // Dashboard CLIENT AMÉLIORÉ
  if (isClient()) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.prenom || 'Client'} ! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu complet de votre activité
          </p>
        </div>

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
        ) : (
          <>
            {/* ALERTES */}
            {alerts.length > 0 && (
              <div className="mb-6 space-y-3">
                {alerts.map((alert, index) => (
                  <Link
                    key={index}
                    to={alert.link}
                    className={`block rounded-lg p-4 transition hover:shadow-md ${alert.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : alert.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-blue-50 border border-blue-200'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <alert.icon
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.type === 'warning'
                          ? 'text-yellow-600'
                          : alert.type === 'success'
                            ? 'text-green-600'
                            : 'text-blue-600'
                          }`}
                      />
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${alert.type === 'warning'
                            ? 'text-yellow-800'
                            : alert.type === 'success'
                              ? 'text-green-800'
                              : 'text-blue-800'
                            }`}
                        >
                          {alert.title}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${alert.type === 'warning'
                            ? 'text-yellow-700'
                            : alert.type === 'success'
                              ? 'text-green-700'
                              : 'text-blue-700'
                            }`}
                        >
                          {alert.message}
                        </p>
                      </div>
                      <FiChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* STATISTIQUES - 8 CARTES CLIQUABLES */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link to="/client/locations" className="block">
                <StatCard
                  title="Mes locations"
                  value={stats?.totalLocations || 0}
                  change={0}
                  trend="neutral"
                  icon="📅"
                />
              </Link>

              <Link to="/client/locations" className="block">
                <StatCard
                  title="En cours"
                  value={stats?.locationsEnCours || 0}
                  change={0}
                  trend="neutral"
                  icon="🚗"
                />
              </Link>

              <Link to="/client/depenses" className="block">
                <StatCard
                  title="Dépenses totales"
                  value={`${Math.round(stats?.montantTotal || 0).toLocaleString('fr-FR')} FCFA`}
                  change={0}
                  trend="neutral"
                  icon="💰"
                />
              </Link>

              <Link to="/client/favoris" className="block">
                <StatCard
                  title="Favoris"
                  value={stats?.totalFavoris || 0}
                  change={0}
                  trend="neutral"
                  icon="⭐"
                />
              </Link>

              <Link to="/client/demandes" className="block">
                <StatCard
                  title="Demandes"
                  value={stats?.demandesEnAttente || 0}
                  change={0}
                  trend="neutral"
                  icon="📋"
                />
              </Link>

              <Link to="/client/avis" className="block">
                <StatCard
                  title="Avis publiés"
                  value={stats?.avisPublies || 0}
                  change={0}
                  trend="neutral"
                  icon="💬"
                />
              </Link>

              <Link to="/client/notifications" className="block">
                <StatCard
                  title="Notifications"
                  value={stats?.notificationsNonLues || 0}
                  change={0}
                  trend="neutral"
                  icon="🔔"
                />
              </Link>

              <Link to="/client/historique" className="block">
                <StatCard
                  title="Actions récentes"
                  value={stats?.actionsRecentes || 0}
                  change={0}
                  trend="neutral"
                  icon="📊"
                />
              </Link>
            </div>

            {/* GRAPHIQUE */}
            {stats?.chart_data && (
              <div className="mb-8">
                <RevenueChart data={stats.chart_data} />
              </div>
            )}

            {/* CONTENU PRINCIPAL - 2 COLONNES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* COLONNE GAUCHE - ACTIVITÉ RÉCENTE */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Activité récente
                    </h2>
                    <Link
                      to="/client/historique"
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Voir tout →
                    </Link>
                  </div>

                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((action) => {
                        const { icon: Icon, color } = getActionIcon(action.type_action);
                        return (
                          <div
                            key={action.id}
                            className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                          >
                            <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                {action.description || action.type_action}
                              </p>
                              {action.vehicule && (
                                <Link
                                  to={`/vehicules/${action.vehicule.id}`}
                                  className="text-sm text-teal-600 hover:text-teal-700 mt-1 inline-block"
                                >
                                  {action.vehicule.nom_complet}
                                </Link>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(action.date_action)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COLONNE DROITE - RECOMMANDATIONS */}
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Pour vous
                  </h2>

                  {recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <Link
                          key={index}
                          to={rec.link}
                          className="block p-3 rounded-lg bg-gradient-to-br from-teal-50 to-blue-50 hover:from-teal-100 hover:to-blue-100 transition"
                        >
                          <h3 className="font-medium text-gray-900 text-sm">
                            {rec.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {rec.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FiStar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Parcourez des véhicules pour recevoir des recommandations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ACTIONS RAPIDES - 6 CARTES */}

          </>
        )}
      </DashboardLayout>
    );
  }

  // Dashboard CONCESSIONNAIRE (inchangé)
  if (isConcessionnaire()) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.nom_entreprise || user?.prenom || 'Concessionnaire'} !
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>

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
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total véhicules"
                value={stats?.totalVehicules || 0}
                change={0}
                trend="neutral"
                icon="🚗"
              />
              <StatCard
                title="Disponibles"
                value={stats?.vehiculesDisponibles || 0}
                change={0}
                trend="neutral"
                icon="✅"
              />
              <StatCard
                title="Locations actives"
                value={stats?.locationsActives || 0}
                change={0}
                trend="neutral"
                icon="📅"
              />
              <StatCard
                title="Revenus"
                value={`${Math.round(stats?.revenusTotal || 0).toLocaleString('fr-FR')} FCFA`}
                change={0}
                trend="neutral"
                icon="💰"
                featured={true}
              />
            </div>

            {stats?.chart_data && (
              <div className="mb-8">
                <RevenueChart data={stats.chart_data} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/my-vehicules/add"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <FaCar className="w-8 h-8 text-teal-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Ajouter un véhicule
                </h3>
                <p className="text-sm text-gray-600">
                  Ajoutez un nouveau véhicule
                </p>
              </Link>

              <Link
                to="/my-vehicules"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <FiMapPin className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Mes véhicules
                </h3>
                <p className="text-sm text-gray-600">
                  Gérez votre flotte
                </p>
              </Link>

              <Link
                to="/my-concessions"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <FiUsers className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Mes concessions
                </h3>
                <p className="text-sm text-gray-600">
                  Gérez vos concessions
                </p>
              </Link>
            </div>
          </>
        )}
      </DashboardLayout>
    );
  }

  // Dashboard ADMIN (inchangé)
  if (isAdmin()) {
    return (
      <DashboardLayout title="Tableau de bord Admin">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, Administrateur !
          </h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble de la plateforme
          </p>
        </div>

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
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total utilisateurs"
                value={stats?.utilisateurs?.total || 0}
                change={0}
                trend="neutral"
                icon="👥"
              />
              <StatCard
                title="Total véhicules"
                value={stats?.vehicules?.total || 0}
                change={0}
                trend="neutral"
                icon="🚗"
              />
              <StatCard
                title="Locations actives"
                value={stats?.locations?.en_cours || 0}
                change={0}
                trend="neutral"
                icon="📅"
              />
              <StatCard
                title="Revenus totaux"
                value={`${Math.round(stats?.revenus?.total || 0).toLocaleString('fr-FR')} FCFA`}
                change={0}
                trend="neutral"
                icon="💰"
                featured={true}
              />
            </div>

            {stats?.chart_data && (
              <div className="mb-8">
                <RevenueChart data={stats.chart_data} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/admin/users"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <FiUsers className="w-8 h-8 text-teal-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Utilisateurs
                </h3>
                <p className="text-sm text-gray-600">
                  Gérer les utilisateurs
                </p>
              </Link>

              <Link
                to="/admin/concessions"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <FiMapPin className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Concessions
                </h3>
                <p className="text-sm text-gray-600">
                  Valider les concessions
                </p>
              </Link>

              <Link
                to="/admin/stats"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <FiTrendingUp className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Statistiques
                </h3>
                <p className="text-sm text-gray-600">
                  Voir les statistiques globales
                </p>
              </Link>
            </div>
          </>
        )}
      </DashboardLayout>
    );
  }

  // Fallback
  return (
    <DashboardLayout title="Tableau de bord">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Rôle non détecté
          </h3>
          <p className="text-gray-600">
            Impossible de déterminer votre rôle utilisateur
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}