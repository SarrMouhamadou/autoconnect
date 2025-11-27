import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import GaugeWidget from '../components/dashboard/GaugeWidget';
import TransactionsTable from '../components/dashboard/TransactionsTable';
import MesConcessionsWidget from '../components/dashboard/MesConcessionsWidget';
import ConcessionSelector from '../components/dashboard/ConcessionSelector';
import ConcessionRequiredAlert from '../components/dashboard/ConcessionRequiredAlert';
import { dashboardData } from '../data/mockData';
import vehiculeService from '../services/vehiculeService';
import concessionService from '../services/concessionService';
import { FiTruck, FiPlus } from 'react-icons/fi';


export default function DashboardPage() {
  const { user, isClient, isConcessionnaire, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConcession, setSelectedConcession] = useState('all');

  // États pour concessionnaire
  const [concessions, setConcessions] = useState([]);
  const [concessionsLoading, setConcessionsLoading] = useState(true);
  const [vehicleStats, setVehicleStats] = useState({
    totalVehicules: 0,
    vehiculesDisponibles: 0,
    vehiculesLoues: 0,
    vehiculesEnMaintenance: 0,
  });
  const [recentVehicles, setRecentVehicles] = useState([]);

  // Charger les concessions du concessionnaire
  const loadConcessions = async () => {
    try {
      setConcessionsLoading(true);
      const data = await concessionService.getMesConcessions();
      setConcessions(data.concessions || []);

      // Si aucune concession sélectionnée et qu'il y a des concessions validées, sélectionner la première
      if (data.concessions && data.concessions.length > 0) {
        const validees = data.concessions.filter(c => c.statut === 'VALIDE');
        if (validees.length > 0 && selectedConcession === 'all') {
          setSelectedConcession(validees[0].id);
        }
      }
    } catch (error) {
      console.error('Erreur chargement concessions:', error);
      setConcessions([]);
    } finally {
      setConcessionsLoading(false);
    }
  };

  // Charger les stats véhicules
  const loadVehicleStats = async () => {
    try {
      const data = await vehiculeService.getMesVehicules();
      const vehicules = data.results || data;

      // Filtrer par concession si une concession est sélectionnée
      const filteredVehicules = selectedConcession === 'all'
        ? vehicules
        : vehicules.filter(v => v.concession?.id === selectedConcession);

      setVehicleStats({
        totalVehicules: filteredVehicules.length,
        vehiculesDisponibles: filteredVehicules.filter(v => v.statut === 'DISPONIBLE').length,
        vehiculesLoues: filteredVehicules.filter(v => v.statut === 'LOUE').length,
        vehiculesEnMaintenance: filteredVehicules.filter(v => v.statut === 'MAINTENANCE').length,
      });

      setRecentVehicles(filteredVehicules.slice(0, 3));
    } catch (error) {
      console.error('Erreur chargement stats véhicules:', error);
    }
  };

  // Charger les données selon le rôle
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isConcessionnaire()) {
        setData(dashboardData.concessionnaire);
        await loadConcessions();
        await loadVehicleStats();
      } else if (isClient()) {
        setData(dashboardData.client);
      } else {
        setData(dashboardData.concessionnaire); // Par défaut pour l'instant
      }

      setLoading(false);
    };

    loadData();
  }, [isConcessionnaire, isClient]);

  // Recharger les stats véhicules quand la concession change
  useEffect(() => {
    if (isConcessionnaire() && !concessionsLoading) {
      loadVehicleStats();
    }
  }, [selectedConcession]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Vérifier si le concessionnaire a une concession validée
  const hasValidConcession = concessions?.some(c => c.statut === 'VALIDE');

  return (
    <DashboardLayout title="Dashboard">
      {/* Alert si aucune concession validée */}
      {isConcessionnaire() && (
        <ConcessionRequiredAlert concessions={concessions} />
      )}

      {/* Filtres de période + Sélecteur de concession */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
            Day
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
            Week
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg">
            Month
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition">
            Year
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Sélecteur de concession */}
          {isConcessionnaire() && hasValidConcession && (
            <ConcessionSelector
              concessions={concessions}
              selectedConcession={selectedConcession}
              onSelect={setSelectedConcession}
            />
          )}

          {/* Date */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">
              1 Sep 2024 - 31 Sep 2024
            </span>
          </div>
        </div>
      </div>

      {/* CONCESSIONNAIRE DASHBOARD */}
      {isConcessionnaire() && data && (
        <>
          {/* Cartes statistiques - Grid 4 colonnes */}
          {/* Cartes statistiques - Grid 4 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Revenus mensuels"
              value="0 FCFA"
              change={0}
              trend="neutral"
              icon="💰"
              featured={true}
            />
            <StatCard
              title="Total Véhicules"
              value={vehicleStats.totalVehicules}
              change={5}
              trend="up"
              icon="🚗"
            />
            <StatCard
              title="Locations actives"
              value={0}
              change={0}
              trend="neutral"
              icon="📋"
            />
            <StatCard
              title="Clients"
              value={0}
              change={0}
              trend="neutral"
              icon="👥"
            />
          </div>

          {/* Section Widget Concessions + Véhicules récents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Widget Mes Concessions */}
            <MesConcessionsWidget
              concessions={concessions}
              loading={concessionsLoading}
            />

            {/* Véhicules récents */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiTruck className="text-teal-600 text-xl" />
                  <h3 className="text-lg font-semibold text-gray-900">Véhicules récents</h3>
                </div>
                <Link
                  to="/my-vehicules"
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Voir tout →
                </Link>
              </div>

              {recentVehicles.length === 0 ? (
                <div className="text-center py-8">
                  <FiTruck className="text-gray-300 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-4">Aucun véhicule</p>
                  {hasValidConcession ? (
                    <Link
                      to="/my-vehicules/add"
                      className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      <FiPlus /> Ajouter un véhicule
                    </Link>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Créez une concession validée pour ajouter des véhicules
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVehicles.map((vehicule) => (
                    <Link
                      key={vehicule.id}
                      to={`/my-vehicules/${vehicule.id}`}
                      className="block border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-3">
                        {vehicule.images && vehicule.images[0] ? (
                          <img
                            src={vehicule.images[0].image}
                            alt={vehicule.nom_modele}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                            <FiTruck className="text-gray-400 text-2xl" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {vehicule.marque} {vehicule.nom_modele}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {vehicule.annee} • {vehicule.carburant}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${vehicule.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
                              vehicule.statut === 'LOUE' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                              {vehicule.statut}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {vehicule.est_disponible_location && vehicule.prix_location_jour ? (
                            <>
                              <div className="text-lg font-bold text-teal-600">
                                {parseInt(vehicule.prix_location_jour).toLocaleString('fr-FR')} FCFA
                              </div>
                              <div className="text-xs text-gray-500">par jour</div>
                            </>
                          ) : vehicule.est_disponible_vente && vehicule.prix_vente ? (
                            <>
                              <div className="text-lg font-bold text-teal-600">
                                {parseInt(vehicule.prix_vente).toLocaleString('fr-FR')} FCFA
                              </div>
                              <div className="text-xs text-gray-500">prix de vente</div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">
                              Prix non défini
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Graphique + Calendar/Gauge - Grid 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Graphique (2/3) */}
            <div className="lg:col-span-2">
              <RevenueChart
                data={data.revenueChart}
                title="Revenus mensuels"
              />
            </div>

            {/* Calendar + Gauge (1/3) */}
            <div className="space-y-6">
              <CalendarWidget events={data.upcomingEvents} />
              <GaugeWidget
                title="Croissance du parc"
                value={75}
                change={5}
              />
            </div>
          </div>

          {/* Tableau des locations récentes */}
          <TransactionsTable
            title="Locations récentes"
            data={data.recentRentals}
          />
        </>
      )}

      {/* CLIENT DASHBOARD */}
      {isClient() && data && (
        <>
          {/* Cartes statistiques - Grid 4 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title={data.stats.activeRentals.label}
              value={data.stats.activeRentals.value}
              change={data.stats.activeRentals.change}
              trend={data.stats.activeRentals.trend}
              icon="🚗"
              featured={true}
            />
            <StatCard
              title={data.stats.totalRentals.label}
              value={data.stats.totalRentals.value}
              change={data.stats.totalRentals.change}
              trend={data.stats.totalRentals.trend}
              icon="📋"
            />
            <StatCard
              title={data.stats.totalSpent.label}
              value={`${data.stats.totalSpent.value.toLocaleString('fr-FR')} FCFA`}
              change={data.stats.totalSpent.change}
              trend={data.stats.totalSpent.trend}
              icon="💰"
            />
            <StatCard
              title={data.stats.savedVehicles.label}
              value={data.stats.savedVehicles.value}
              change={data.stats.savedVehicles.change}
              trend={data.stats.savedVehicles.trend}
              icon="❤️"
            />
          </div>

          {/* Graphique + Calendrier */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <RevenueChart
                data={data.spendingChart}
                title="Historique des dépenses"
              />
            </div>
            <div>
              <CalendarWidget events={data.upcomingRentals} />
            </div>
          </div>

          {/* Mes réservations */}
          <TransactionsTable
            title="Mes réservations"
            data={data.myBookings}
          />
        </>
      )}
    </DashboardLayout>
  );
}