import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated, isClient, isConcessionnaire, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (!user) return '?';
    return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
  };

  // Obtenir l'icône selon le type
  const getTypeIcon = () => {
    if (isClient()) return '👤';
    if (isConcessionnaire()) return '🏢';
    if (isAdmin()) return '👨‍💼';
    return '🚗';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🚗</span>
              <span className="text-xl font-bold text-gray-900">AutoConnect</span>
            </Link>

            {/* Navigation links (si authentifié) */}
            {isAuthenticated() && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                >
                  Dashboard
                </Link>

                {isClient() && (
                  <>
                    <Link
                      to="/vehicles"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                    >
                      Véhicules
                    </Link>
                    <Link
                      to="/my-rentals"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                    >
                      Mes locations
                    </Link>
                  </>
                )}

                {isConcessionnaire() && (
                  <>
                    <Link
                      to="/my-vehicles"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                    >
                      Mes véhicules
                    </Link>
                    <Link
                      to="/rentals"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                    >
                      Locations
                    </Link>
                    <Link
                      to="/statistics"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                    >
                      Statistiques
                    </Link>
                  </>
                )}

                {isAdmin() && (
                  <>
                    <Link
                      to="/admin/users"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                    >
                      Utilisateurs
                    </Link>
                    <Link
                      to="/admin/concessions"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                    >
                      Concessions
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="relative">
                {/* Bouton profil */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  {/* Avatar */}
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {user?.photo_profil ? (
                        <img
                          src={user.photo_profil}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        getInitials()
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.prenom} {user?.nom}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span className="mr-1">{getTypeIcon()}</span>
                        {user?.type_utilisateur}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <>
                    {/* Overlay pour fermer le dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1">
                        {/* Infos utilisateur (mobile) */}
                        <div className="md:hidden px-4 py-3 border-b border-gray-200">
                          <div className="text-sm font-medium text-gray-900">
                            {user?.prenom} {user?.nom}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {user?.email}
                          </div>
                        </div>

                        {/* Liens */}
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Mon profil
                        </Link>

                        <Link
                          to="/profile/edit"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier le profil
                        </Link>

                        <Link
                          to="/profile/change-password"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Changer le mot de passe
                        </Link>

                        <div className="border-t border-gray-200 my-1"></div>

                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                        >
                          <svg className="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Boutons pour non-authentifiés
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
  );
}