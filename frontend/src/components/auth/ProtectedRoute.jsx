import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Composant pour protéger les routes
 * Redirige vers /login si l'utilisateur n'est pas authentifié
 * 
 * Usage:
 * <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading, isAdmin, isConcessionnaire, isClient } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated()) {
    // Sauvegarder l'URL d'origine pour rediriger après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Si des rôles spécifiques sont requis, vérifier avec les fonctions
  if (allowedRoles.length > 0 && user) {
    let hasRequiredRole = false;

    // Vérifier chaque rôle requis
    for (const role of allowedRoles) {
      if (role === 'ADMIN' && isAdmin()) {
        hasRequiredRole = true;
        break;
      }
      if (role === 'CONCESSIONNAIRE' && isConcessionnaire()) {
        hasRequiredRole = true;
        break;
      }
      if (role === 'CLIENT' && isClient()) {
        hasRequiredRole = true;
        break;
      }
    }

    if (!hasRequiredRole) {
      // Rediriger vers une page "Non autorisé"
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  // Si tout est OK, afficher le contenu
  return children;
}