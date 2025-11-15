import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🚗 AutoConnect
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated() ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Bienvenue sur AutoConnect
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La plateforme de gestion de location de véhicules pour les concessionnaires au Sénégal
          </p>
          
          {!isAuthenticated() && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                Commencer gratuitement
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 text-lg font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition shadow-lg"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gestion de véhicules
            </h3>
            <p className="text-gray-600">
              Gérez facilement votre flotte de véhicules avec notre interface intuitive
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Statistiques en temps réel
            </h3>
            <p className="text-gray-600">
              Suivez vos performances et revenus avec des tableaux de bord détaillés
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gestion des clients
            </h3>
            <p className="text-gray-600">
              Centralisez toutes vos demandes et locations de manière efficace
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated() && (
          <div className="mt-20 bg-blue-600 rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à démarrer ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez AutoConnect dès aujourd'hui et simplifiez la gestion de vos locations
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              Créer un compte gratuitement
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 AutoConnect. Tous droits réservés. | Projet de mémoire - Mouhamadou Moustapha SARR
          </p>
        </div>
      </footer>
    </div>
  );
}