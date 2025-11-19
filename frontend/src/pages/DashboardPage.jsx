import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import GaugeWidget from '../components/dashboard/GaugeWidget';
import TransactionsTable from '../components/dashboard/TransactionsTable';
import { dashboardData } from '../data/mockData';
import vehiculeService from '../services/vehiculeService';
import { FiTruck, FiPlus } from 'react-icons/fi';


export default function DashboardPage() {
  const { user, isClient, isConcessionnaire, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ajout
  const [vehicleStats, setVehicleStats] = useState({
    totalVehicules: 0,
    vehiculesDisponibles: 0,
    vehiculesLoues: 0,
    vehiculesEnMaintenance: 0,
  });
  const [recentVehicles, setRecentVehicles] = useState([]);

  const loadVehicleStats = async () => {
    try {
      const data = await vehiculeService.getMesVehicules();
      const vehicules = data.results || data;

      setVehicleStats({
        totalVehicules: vehicules.length,
        vehiculesDisponibles: vehicules.filter(v => v.statut === 'DISPONIBLE').length,
        vehiculesLoues: vehicules.filter(v => v.statut === 'LOUE').length,
        vehiculesEnMaintenance: vehicules.filter(v => v.statut === 'MAINTENANCE').length,
      });

      setRecentVehicles(vehicules.slice(0, 3));
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
        await loadVehicleStats();
      } else if (isClient()) {
        setData(dashboardData.client);
      } else {
        // Admin ou autre
        setData(dashboardData.concessionnaire); // Par défaut pour l'instant
      }

      setLoading(false);
    };

    loadData();
  }, [isConcessionnaire, isClient]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Filtres de période */}
      <div className="flex items-center justify-between mb-6">
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

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">
            1 Sep 2024 - 31 Sep 2024
          </span>
        </div>
      </div>

      {/* CONCESSIONNAIRE DASHBOARD */}
      {isConcessionnaire() && data && (
        <>
          {/* Cartes statistiques - Grid 4 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title={data.stats.revenue.label}
              value={`${data.stats.revenue.value.toLocaleString('fr-FR')} FCFA`}
              change={data.stats.revenue.change}
              trend={data.stats.revenue.trend}
              icon="💰"
              featured={true}
            />
            <StatCard
              title={data.stats.activeVehicles.label}
              value={data.stats.activeVehicles.value}
              change={data.stats.activeVehicles.change}
              trend={data.stats.activeVehicles.trend}
              icon="🚗"
            />
            <StatCard
              title={data.stats.currentRentals.label}
              value={data.stats.currentRentals.value}
              change={data.stats.currentRentals.change}
              trend={data.stats.currentRentals.trend}
              icon="📋"
            />
            <StatCard
              title={data.stats.occupancyRate.label}
              value={`${data.stats.occupancyRate.value}%`}
              change={data.stats.occupancyRate.change}
              trend={data.stats.occupancyRate.trend}
              icon="📊"
            />
          </div>

          {/* ⬅️ AJOUTER cette section - Statistiques véhicules réels */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <FiTruck className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {vehicleStats.totalVehicules}
              </div>
              <div className="text-sm text-gray-600">Total véhicules</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiTruck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {vehicleStats.vehiculesDisponibles}
              </div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiTruck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {vehicleStats.vehiculesLoues}
              </div>
              <div className="text-sm text-gray-600">Loués</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FiTruck className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {vehicleStats.vehiculesEnMaintenance}
              </div>
              <div className="text-sm text-gray-600">Maintenance</div>
            </div>
          </div>

          {/* ⬅️ AJOUTER cette section - Actions rapides */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/my-vehicles/add"
                className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
              >
                <div className="p-3 bg-teal-100 rounded-lg">
                  <FiPlus className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Ajouter un véhicule</div>
                  <div className="text-sm text-gray-600">Élargissez votre flotte</div>
                </div>
              </Link>

              <Link
                to="/my-vehicles"
                className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
              >
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiTruck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Gérer mes véhicules</div>
                  <div className="text-sm text-gray-600">Voir toute la flotte</div>
                </div>
              </Link>

              <Link
                to="/profile"
                className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
              >
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiTruck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Mon profil</div>
                  <div className="text-sm text-gray-600">Gérer mes informations</div>
                </div>
              </Link>
            </div>
          </div>


          {/* ⬅️ AJOUTER cette section - Véhicules récents */}
          {/* ⬅️ SECTION - Véhicules récents */}
          {recentVehicles.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Véhicules récents
                </h3>
                <Link
                  to="/my-vehicles"
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Voir tout
                </Link>
              </div>

              <div className="space-y-4">
                {recentVehicles.map((vehicule) => (
                  <Link
                    key={vehicule.id}
                    to={`/my-vehicles/edit/${vehicule.id}`}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition"
                  >
                    <div className="w-20 h-20 flex-shrink-0">
                      {vehicule.image_principale ? (
                        <img
                          src={vehicule.image_principale}
                          alt={vehicule.nom_complet}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-2xl">
                          🚗
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {vehicule.nom_complet}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{vehicule.type_vehicule}</span>
                        <span>•</span>
                        <span>{vehicule.transmission}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded text-xs ${vehicule.statut === 'DISPONIBLE'
                            ? 'bg-green-100 text-green-800'
                            : vehicule.statut === 'LOUE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                          {vehicule.statut}
                        </span>
                      </div>

                      {/* ✅ AJOUTER : Badges vente/location */}
                      <div className="flex items-center space-x-2 mt-2">
                        {vehicule.est_disponible_vente && (
                          <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
                            🏷️ Vente
                          </span>
                        )}
                        {vehicule.est_disponible_location && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            📅 Location
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {/* ✅ CORRIGER : Afficher prix selon le type */}
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
                  </Link>
                ))}
              </div>
            </div>
          )}



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
              title={data.stats.favorites.label}
              value={data.stats.favorites.value}
              change={data.stats.favorites.change}
              trend={data.stats.favorites.trend}
              icon="❤️"
            />
          </div>

          {/* Historique des locations */}
          <div className="mb-6">
            <TransactionsTable
              title="Mes locations"
              data={data.rentalHistory}
            />
          </div>

          {/* Message de bienvenue */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">
              Bienvenue, {user?.prenom} ! 👋
            </h2>
            <p className="text-teal-100 mb-4">
              Prêt à louer votre prochain véhicule ?
            </p>
            <button className="px-6 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-gray-100 transition">
              Parcourir les véhicules
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}