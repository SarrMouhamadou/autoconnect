import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
  FiHome,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiInfo
} from 'react-icons/fi';

export default function Navbar() {
  const { user, isAuthenticated, logout, isClient, isConcessionnaire, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Détecter le scroll pour changer le style du navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menu de navigation principal
  const mainNavItems = [
    { path: '/', label: 'Accueil', icon: FiHome },
    { path: '/vehicules', label: 'Véhicules', icon: FiTruck },
    { path: '/concessions', label: 'Concessions', icon: FiMapPin },
    { path: '/about', label: 'À propos', icon: FiInfo },
    { path: '/contact', label: 'Contact', icon: FiPhone },
  ];

  // Menu utilisateur selon le rôle
  const getUserMenuItems = () => {
    const baseItems = [
      { path: '/profile', label: 'Mon Profil', icon: FiUser },
      { path: '/settings', label: 'Paramètres', icon: FiSettings },
    ];

    if (isClient()) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
        ...baseItems,
      ];
    }

    if (isConcessionnaire()) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/my-vehicules', label: 'Mes Véhicules', icon: FiTruck },
        { path: '/my-concessions', label: 'Mes Concessions', icon: FiMapPin },
        ...baseItems,
      ];
    }

    if (isAdmin()) {
      return [
        { path: '/admin/dashboard', label: 'Admin Dashboard', icon: FiHome },
        ...baseItems,
      ];
    }

    return baseItems;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-gray-900 shadow-lg'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
              <FiTruck className="text-white text-2xl" />
            </div>
            <span className="text-2xl font-bold text-white">
              Auto<span className="text-blue-500">Connect</span>
            </span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Boutons Authentification / Menu Utilisateur */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.prenom?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-gray-400 text-xs capitalize">
                      {user?.type_utilisateur?.toLowerCase()}
                    </p>
                  </div>
                  <FiChevronDown
                    className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu Utilisateur */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-700">
                    {getUserMenuItems().map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                        >
                          <Icon className="text-lg" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                    <hr className="my-2 border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2.5 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-all w-full"
                    >
                      <FiLogOut className="text-lg" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-white hover:text-blue-400 font-medium transition-all"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Bouton Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl p-2 hover:bg-gray-800 rounded-lg transition-all"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-4 space-y-2">
            {/* Navigation principale */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            <hr className="my-4 border-gray-800" />

            {/* Authentification Mobile */}
            {isAuthenticated() ? (
              <>
                {/* Info utilisateur */}
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.prenom?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-gray-400 text-sm capitalize">
                      {user?.type_utilisateur?.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Menu utilisateur */}
                {getUserMenuItems().map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all"
                    >
                      <Icon className="text-lg" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-all w-full"
                >
                  <FiLogOut className="text-lg" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-center text-white hover:bg-gray-800 rounded-lg transition-all font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg transition-all font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}