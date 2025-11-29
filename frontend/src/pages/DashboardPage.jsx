import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';

import {
  FiCalendar, FiDollarSign, FiTrendingUp, FiUsers,
  FiMapPin, FiAlertCircle, FiMessageSquare, FiClock,
  FiStar, FiBell, FiFileText, FiSettings, FiHelpCircle,
  FiChevronRight, FiAlertTriangle, FiCheckCircle, FiMail,
  FiTag, FiPieChart, FiActivity
} from 'react-icons/fi';

import { FaCar } from 'react-icons/fa';
import locationService from '../services/locationService';
import vehiculeService from '../services/vehiculeService';
import statistiqueService from '../services/statistiqueService';
import historiqueService from '../services/historiqueService';
import notificationService from '../services/notificationService';
import favoriService from '../services/favoriService';
import demandeService from '../services/demandeService';
import adminService from '../services/adminService'; // ✅ AJOUTÉ

export default function DashboardPage() {
  const { user, isClient, isConcessionnaire, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
     console.log('🔍 USER DATA:', user);
    if (isAdmin()) {
      loadAdminDashboard();
    } else if (isConcessionnaire()) {
      loadConcessionnaireDashboard();
    } else if (isClient()) {
      loadClientDashboard();
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
        actionsRecentes: historique?.length || 0,
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

  const loadConcessionnaireDashboard = async () => {
    try {
      setLoading(true);

      const [
        vehiculesData,
        statsData,
        demandesData,
        notificationsData
      ] = await Promise.all([
        vehiculeService.getMesVehicules().catch(() => ({ results: [] })),
        statistiqueService.getDashboardConcessionnaire().catch(() => ({})),
        demandeService.getDemandesRecues().catch(() => []),
        notificationService.getMesNotifications().catch(() => [])
      ]);

      const vehicules = Array.isArray(vehiculesData)
        ? vehiculesData
        : (vehiculesData.results || []);

      const demandes = Array.isArray(demandesData)
        ? demandesData
        : (demandesData.results || []);

      const notifications = Array.isArray(notificationsData)
        ? notificationsData
        : (notificationsData.results || []);

      // Calculer statistiques
      const vehiculesDisponibles = vehicules.filter(v => v.statut === 'DISPONIBLE').length;
      const vehiculesLoues = vehicules.filter(v => v.statut === 'LOUE').length;
      const demandesEnAttente = demandes.filter(d => d.statut === 'EN_ATTENTE').length;
      const notificationsNonLues = notifications.filter(n => !n.lue).length;

      // Alertes concessionnaire
      const newAlerts = [];

      if (demandesEnAttente > 0) {
        newAlerts.push({
          type: 'warning',
          icon: FiMail,
          title: `${demandesEnAttente} demande${demandesEnAttente > 1 ? 's' : ''} en attente`,
          message: 'Des clients attendent votre réponse',
          link: '/concessionnaire/demandes'
        });
      }

      if (notificationsNonLues > 0) {
        newAlerts.push({
          type: 'info',
          icon: FiBell,
          title: `${notificationsNonLues} notification${notificationsNonLues > 1 ? 's' : ''} non lue${notificationsNonLues > 1 ? 's' : ''}`,
          message: 'Vous avez de nouvelles notifications',
          link: '/concessionnaire/notifications'
        });
      }

      // Véhicules nécessitant maintenance
      const vehiculesEnMaintenance = vehicules.filter(v => v.statut === 'MAINTENANCE').length;
      if (vehiculesEnMaintenance > 0) {
        newAlerts.push({
          type: 'warning',
          icon: FiAlertTriangle,
          title: `${vehiculesEnMaintenance} véhicule${vehiculesEnMaintenance > 1 ? 's' : ''} en maintenance`,
          message: 'Des véhicules nécessitent votre attention',
          link: '/my-vehicules'
        });
      }

      setStats({
        totalVehicules: vehicules.length,
        vehiculesDisponibles,
        vehiculesLoues,
        vehiculesEnMaintenance,
        locationsActives: statsData?.locations?.en_cours || 0,
        revenusTotal: statsData?.revenus?.total || 0,
        revenusMois: statsData?.revenus?.mois_courant || 0,
        demandesEnAttente,
        notificationsNonLues,
        tauxOccupation: vehicules.length > 0
          ? Math.round((vehiculesLoues / vehicules.length) * 100)
          : 0,
        noteMoyenne: statsData?.avis?.note_moyenne || 0,
        nouveauxClients: statsData?.clients?.nouveaux || 0,
        ...statsData
      });

      setAlerts(newAlerts);

      // Activité récente (demandes/avis récents)
      const recentDemandes = demandes.slice(0, 5).map(d => ({
        id: d.id,
        type: 'demande',
        description: `Nouvelle ${d.type_demande?.toLowerCase()} de ${d.client?.nom_complet}`,
        date: d.date_creation,
        link: `/concessionnaire/demandes`
      }));

      setRecentActivity(recentDemandes);

    } catch (err) {
      console.error('Erreur chargement dashboard concessionnaire:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminDashboard = async () => {
    try {
      setLoading(true);

      // Charger les statistiques admin
      const statsData = await statistiqueService.getDashboardAdmin();
      setStats(statsData);

      // Charger les éléments en attente
      const [usersEnAttente, concessionsEnAttente] = await Promise.all([
        adminService.getUsersEnAttente().catch(() => ({ results: [] })),
        adminService.getConcessionsEnAttente().catch(() => ({ results: [] }))
      ]);

      // Créer des alertes
      const newAlerts = [];

      const usersArray = Array.isArray(usersEnAttente) ? usersEnAttente : (usersEnAttente.results || []);
      const concessionsArray = Array.isArray(concessionsEnAttente) ? concessionsEnAttente : (concessionsEnAttente.results || []);

      if (usersArray.length > 0) {
        newAlerts.push({
          type: 'warning',
          icon: FiUsers,
          title: `${usersArray.length} concessionnaire(s) en attente`,
          message: `${usersArray.length} concessionnaire(s) en attente de validation`,
          link: '/admin/utilisateurs'
        });
      }

      if (concessionsArray.length > 0) {
        newAlerts.push({
          type: 'warning',
          icon: FiMapPin,
          title: `${concessionsArray.length} concession(s) en attente`,
          message: `${concessionsArray.length} concession(s) en attente de validation`,
          link: '/admin/concessions'
        });
      }

      setAlerts(newAlerts);

    } catch (error) {
      console.error('Erreur chargement dashboard admin:', error);
      setError('Erreur lors du chargement du dashboard');
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
      CONSULTATION_VEHICULE: { icon: FaCar, color: 'text-blue-600' },
      AJOUT_FAVORI: { icon: FiStar, color: 'text-yellow-600' },
      DEMANDE_CONTACT: { icon: FiMessageSquare, color: 'text-purple-600' },
      RESERVATION: { icon: FiCalendar, color: 'text-green-600' },
      demande: { icon: FiMail, color: 'text-blue-600' }
    };
    return icons[typeAction] || { icon: FiFileText, color: 'text-gray-600' };
  };

  // Dashboard CLIENT AMÉLIORÉ
  if (isClient() && !isAdmin() && !isConcessionnaire()) {
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
          </>
        )}
      </DashboardLayout>
    );
  }

  // Dashboard CONCESSIONNAIRE AMÉLIORÉ
  if (isConcessionnaire() && !isAdmin()) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.nom_entreprise || user?.prenom || 'Concessionnaire'} ! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Pilotez votre activité en temps réel
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
            {/* ALERTES CONCESSIONNAIRE */}
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
              <Link to="/concessionnaire/statistiques" className="block">
                <StatCard
                  title="Revenus du mois"
                  value={`${Math.round((stats?.revenusMois || 0) / 1000)}k FCFA`}
                  change={12}
                  trend="up"
                  icon="💰"
                />
              </Link>

              <Link to="/my-vehicules" className="block">
                <StatCard
                  title="Véhicules"
                  value={stats?.totalVehicules || 0}
                  change={0}
                  trend="neutral"
                  icon="🚗"
                />
              </Link>

              <Link to="/my-vehicules" className="block">
                <StatCard
                  title="Disponibles"
                  value={stats?.vehiculesDisponibles || 0}
                  change={0}
                  trend="neutral"
                  icon="✅"
                />
              </Link>

              <Link to="/concessionnaire/demandes" className="block">
                <StatCard
                  title="Demandes"
                  value={stats?.demandesEnAttente || 0}
                  change={0}
                  trend="neutral"
                  icon="📧"
                />
              </Link>

              <Link to="/concessionnaire/statistiques" className="block">
                <StatCard
                  title="Taux d'occupation"
                  value={`${stats?.tauxOccupation || 0}%`}
                  change={-3}
                  trend="down"
                  icon="📊"
                />
              </Link>

              <Link to="/concessionnaire/avis" className="block">
                <StatCard
                  title="Note moyenne"
                  value={`${stats?.noteMoyenne || 0}/5`}
                  change={0}
                  trend="neutral"
                  icon="⭐"
                />
              </Link>

              <Link to="/concessionnaire/clients" className="block">
                <StatCard
                  title="Nouveaux clients"
                  value={stats?.nouveauxClients || 0}
                  change={8}
                  trend="up"
                  icon="👥"
                />
              </Link>

              <Link to="/concessionnaire/notifications" className="block">
                <StatCard
                  title="Notifications"
                  value={stats?.notificationsNonLues || 0}
                  change={0}
                  trend="neutral"
                  icon="🔔"
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
                      to="/concessionnaire/demandes"
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Voir tout →
                    </Link>
                  </div>

                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((action) => {
                        const { icon: Icon, color } = getActionIcon(action.type);
                        return (
                          <Link
                            key={action.id}
                            to={action.link}
                            className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 -mx-3 px-3 py-2 rounded transition"
                          >
                            <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                {action.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(action.date)}
                              </p>
                            </div>
                            <FiChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiActivity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COLONNE DROITE - ACTIONS RAPIDES */}
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions rapides
                  </h2>

                  <div className="space-y-3">
                    <Link
                      to="/my-vehicules/add"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 transition"
                    >
                      <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <FaCar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          Ajouter un véhicule
                        </h3>
                        <p className="text-xs text-gray-600">
                          Nouveau véhicule
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/concessionnaire/promotions"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition"
                    >
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <FiTag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          Créer promotion
                        </h3>
                        <p className="text-xs text-gray-600">
                          Booster les ventes
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/my-vehicules"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FiMapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          Mes véhicules
                        </h3>
                        <p className="text-xs text-gray-600">
                          Gérer la flotte
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/concessionnaire/statistiques"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition"
                    >
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <FiPieChart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          Statistiques
                        </h3>
                        <p className="text-xs text-gray-600">
                          Analyser performance
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    );
  }

  // ========================================
  // Dashboard ADMIN - ✅ CORRIGÉ
  // ========================================
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
            {/* ALERTES ADMIN */}
            {alerts.length > 0 && (
              <div className="mb-6 space-y-3">
                {alerts.map((alert, index) => (
                  <Link
                    key={index}
                    to={alert.link}
                    className="block bg-amber-50 border border-amber-200 rounded-lg p-4 hover:bg-amber-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <alert.icon className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-900 font-medium">{alert.message}</span>
                      </div>
                      <FiChevronRight className="text-amber-600" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* KPIs ADMIN */}
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
                value={`${Math.round((stats?.revenus?.total || 0) / 1000)}k FCFA%`}
                change={0}
                trend="neutral"
                icon="💰"
              />
            </div>

            {/* GRAPHIQUE */}
            {stats?.chart_data && (
              <div className="mb-8">
                <RevenueChart data={stats.chart_data} />
              </div>
            )}

            {/* RACCOURCIS ADMIN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/admin/utilisateurs"
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
                to="/admin/statistiques"
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