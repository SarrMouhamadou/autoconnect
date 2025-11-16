import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ================================ */}
          {/* ROUTES PUBLIQUES */}
          {/* ================================ */}

          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />  {/* ← NOUVELLE ROUTE */}
          <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />  {/* ← Redirection */}
          <Route path="/register" element={<Navigate to="/auth?mode=signup" replace />} />  {/* ← Redirection */}


          {/* ================================ */}
          {/* ROUTES PROTÉGÉES */}
          {/* ================================ */}

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

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
      </AuthProvider>
    </Router>
  );
}

export default App;