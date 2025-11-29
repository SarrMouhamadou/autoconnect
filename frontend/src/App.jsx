import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Barre flottante de comparaison
import CompareBar from './components/compare/CompareBar';

// Pages publiques
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';


// Pages protégées
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

// Pages Véhicules (Concessionnaire)
import MyVehiculesPage from './pages/vehicules/MyVehiculesPage';
import AddVehiculesPage from './pages/vehicules/AddVehiculesPage';
import EditVehiculesPage from './pages/vehicules/EditVehiculesPage';

// Pages Catalogue (Client)
import VehiculesPage from './pages/vehicules/VehiculesPage';
import VehiculeDetailPage from './pages/vehicules/VehiculeDetailPage';

// Pages Concessions
import MyConcessionsPage from './pages/concessions/MyConcessionsPage';
import AddConcessionPage from './pages/concessions/AddConcessionPage';
import EditConcessionPage from './pages/concessions/EditConcessionPage';
import ConcessionDetailPage from './pages/concessions/ConcessionDetailPage';
import ConcessionsPage from './pages/concessions/ConcessionsPage';


// Page Comparateur
import ComparePage from './pages/compare/ComparePage';

// Page Client
import MesLocationsPage from './pages/client/MesLocationsPage';
import LocationDetailPage from './pages/client/LocationDetailPage';
import DemandesPage from './pages/client/DemandesPage';
import FavorisPage from './pages/client/FavorisPage';
import HistoriquePage from './pages/client/HistoriquePage';
import AvisPage from './pages/client/AvisPage';
import NotificationsPage from './pages/client/NotificationsPage';
import DepensesPage from './pages/client/DepensesPage';
import ParametresPage from './pages/client/ParametresPage';
import AidePage from './pages/client/AidePage';
import ReservationPage from './pages/vehicules/ReservationPage';

// Pages Concessionnaire
import ProfilPage from './pages/concessionnaire/ProfilPage';
import EditProfilPage from './pages/concessionnaire/EditProfilPage'
import ChangePasswordPage from './pages/concessionnaire/ChangePasswordPage';
import DemandesPageConcessionnaire from './pages/concessionnaire/DemandesPage';
import AvisPageConcessionnaire from './pages/concessionnaire/AvisPage';
import ClientsPage from './pages/concessionnaire/ClientsPage';
import PromotionsPage from './pages/concessionnaire/PromotionsPage';
import StatistiquesPage from './pages/concessionnaire/StatistiquesPage';
import NotificationsPageConcessionnaire from './pages/concessionnaire/NotificationsPage';
import ParametresPageConcessionnaire from './pages/concessionnaire/ParametresPage';
import AidePageConcessionnaire from './pages/concessionnaire/AidePage';
import LocationsPage from './pages/concessionnaire/LocationsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Wrapper CompareProvider pour activer la comparaison dans toute l'app */}
        <CompareProvider>
          <Routes>
            {/* ================================ */}
            {/* ROUTES PUBLIQUES */}
            {/* ================================ */}

            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
            <Route path="/register" element={<Navigate to="/auth?mode=signup" replace />} />
            <Route path="/vehicules/:id" element={<VehiculeDetailPage />} />
            <Route path="/concessions/:id" element={<ConcessionDetailPage />} />
            <Route path="/concessions" element={<ConcessionsPage />} />

            {/* Route Comparateur */}
            <Route path="/compare" element={<ComparePage />} />

            {/* ROUTE RÉSERVATION - Publique mais vérifie auth dans le composant */}
            <Route path="/vehicules/:id/reserver" element={<ReservationPage />} />

            {/* ================================ */}
            {/* ROUTES PROTÉGÉES */}
            {/* ================================ */}

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

            {/* Profil

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />

             */}






            {/* Settings */}
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />


            {/* Routes Véhicules - Concessionnaire uniquement */}
            <Route
              path="/my-vehicules"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <MyVehiculesPage />
                </ProtectedRoute>
              }
            />


            <Route
              path="/my-vehicules/add"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <AddVehiculesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-vehicules/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <EditVehiculesPage />
                </ProtectedRoute>
              }
            />

            {/* Routes Catalogue - Public et Client */}
            <Route path="/vehicules" element={<VehiculesPage />} />

            {/* Routes Concessions */}
            <Route
              path="/my-concessions"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <MyConcessionsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-concessions/add"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <AddConcessionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-concessions/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <EditConcessionPage />
                </ProtectedRoute>
              }
            />


            {/* ROUTES CLIENT - Protégées */}


            <Route
              path="/client/locations"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <MesLocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/locations/:id"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <LocationDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/demandes"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <DemandesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/favoris"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <FavorisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/historique"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <HistoriquePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/avis"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <AvisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/notifications"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/depenses"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <DepensesPage />
                </ProtectedRoute>
              }
            />


            <Route
              path="/client/profil"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />


            <Route
              path="/client/parametres"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <ParametresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/aide"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <AidePage />
                </ProtectedRoute>
              }
            />

            {/* ROUTES CONCESSIONNAIRE - Protégées */}
            <Route path="/concessionnaire/profil" element={<ProfilPage />} />
            <Route path="/concessionnaire/profil/edit" element={<EditProfilPage />} />
            <Route path="/concessionnaire/profil/change-password" element={<ChangePasswordPage />} />
            <Route
              path="/concessionnaire/demandes"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <DemandesPageConcessionnaire />
                </ProtectedRoute>
              }
            />
            <Route
              path="/concessionnaire/avis"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <AvisPageConcessionnaire />
                </ProtectedRoute>
              }
            />
            <Route
              path="/concessionnaire/clients"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <ClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/concessionnaire/promotions"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <PromotionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/concessionnaire/statistiques"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <StatistiquesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/concessionnaire/notifications"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <NotificationsPageConcessionnaire />
                </ProtectedRoute>
              }
            />
            <Route
              path="/concessionnaire/parametres"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <ParametresPageConcessionnaire />
                </ProtectedRoute>
              }
            />

            <Route
              path="/concessionnaire/aide"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <AidePageConcessionnaire />
                </ProtectedRoute>
              }
            />

            <Route
              path="/concessionnaire/locations"
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <LocationsPage />
                </ProtectedRoute>
              }
            />

            {/* ================================ */}
            {/* ROUTE 404 - PAGE NON TROUVÉE */}
            {/* ================================ */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Barre flottante de comparaison (visible sur toutes les pages) */}
          <CompareBar />
        </CompareProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;