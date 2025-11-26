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
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import ChangePasswordPage from './pages/profile/ChangePasswordPage';
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

            {/* ================================ */}
            {/* ROUTES PROTÉGÉES */}
            {/* ================================ */}

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

            {/* Profil */}
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


            {/* ================================ */}
            {/* ROUTES FUTURES (Phases 3-7) */}
            {/* ================================ */}

            {/* Véhicules (Phase 3) - À venir */}
            {/* 
            <Route 
              path="/vehicles" 
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <VehiclesPage />
                </ProtectedRoute>
              } 
            />
            */}

            {/* Locations (Phase 4) - À venir */}
            {/* 
            <Route 
              path="/my-rentals" 
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <MyRentalsPage />
                </ProtectedRoute>
              } 
            />
            */}

            {/* Concessionnaires (Phase 5) - À venir */}
            {/* 
            <Route 
              path="/my-vehicles" 
              element={
                <ProtectedRoute allowedRoles={['CONCESSIONNAIRE']}>
                  <MyVehiclesPage />
                </ProtectedRoute>
              } 
            />
            */}

            {/* Admin (Phase 6) - À venir */}
            {/* 
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['ADMINISTRATEUR']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              } 
            />
            */}

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