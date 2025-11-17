import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import GaugeWidget from '../components/dashboard/GaugeWidget';
import TransactionsTable from '../components/dashboard/TransactionsTable';
import { dashboardData } from '../data/mockData';

export default function DashboardPage() {
  const { user, isClient, isConcessionnaire, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données selon le rôle
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isConcessionnaire()) {
        setData(dashboardData.concessionnaire);
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