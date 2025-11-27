import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiTruck, FiFileText, FiBarChart2,
  FiUsers, FiMessageSquare, FiSettings,
  FiHelpCircle, FiLogOut, FiSliders
} from 'react-icons/fi';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout, isConcessionnaire, isAdmin } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
    ];

    // Menu pour CONCESSIONNAIRE
    if (user?.type_utilisateur === 'CONCESSIONNAIRE') {
      return [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
        { path: '/my-concessions', icon: FaMapMarkerAlt, label: 'Mes concessions', roles: ['CONCESSIONNAIRE'] },
        { path: '/my-vehicules', icon: FiTruck, label: 'Mes véhicules', roles: ['CONCESSIONNAIRE'] },
        { path: '/rentals', icon: FiFileText, label: 'Locations', roles: ['all'] },
        { path: '/analytics', icon: FiBarChart2, label: 'Statistiques', roles: ['CONCESSIONNAIRE'] },
        { path: '/messages', icon: FiMessageSquare, label: 'Messages', roles: ['all'] },
      ];
    }

    // Menu pour CLIENT
    if (user?.type_utilisateur === 'CLIENT') {
      return [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
        { path: '/vehicules', icon: FiTruck, label: 'Catalogue', roles: ['all'] },
        { path: '/my-bookings', icon: FiFileText, label: 'Mes réservations', roles: ['CLIENT'] },
        { path: '/client/depenses', icon: FiMessageSquare, label: 'Dépenses', roles: ['all'] },
      ];
    }

    // Menu pour ADMINISTRATEUR
    if (user?.type_utilisateur === 'ADMINISTRATEUR') {
      return [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
        { path: '/admin/concessions', icon: FaMapMarkerAlt, label: 'Concessions', roles: ['ADMINISTRATEUR'] },
        { path: '/vehicules', icon: FiTruck, label: 'Véhicules', roles: ['all'] },
        { path: '/rentals', icon: FiFileText, label: 'Locations', roles: ['all'] },
        { path: '/analytics', icon: FiBarChart2, label: 'Statistiques', roles: ['ADMINISTRATEUR'] },
        { path: '/dealers', icon: FiUsers, label: 'Concessionnaires', roles: ['ADMINISTRATEUR'] },
        { path: '/messages', icon: FiMessageSquare, label: 'Messages', roles: ['all'] },
      ];
    }

    // Menu par défaut
    return baseItems;
  };

  const menuItems = getMenuItems();

  const bottomMenuItems = [
    { path: '/client/profil', icon: FiSettings, label: 'Mon profil' },
    { path: '/client/parametres', icon: FiSliders, label: 'Préférences' },
    { path: '/client/aide', icon: FiHelpCircle, label: 'Centre d\'aide' },
  ];
  const isActive = (path) => location.pathname === path;

  const shouldShowItem = (item) => {
    if (item.roles.includes('all')) return true;
    return item.roles.includes(user?.type_utilisateur);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - TEAL */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-teal-700 to-teal-900 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } w-60 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo - ALIGNÉ AVEC LE HEADER */}
          <div className="h-[73px] flex items-center px-6 border-b border-teal-600/30">
            <Link to="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="text-teal-700 font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-white">AutoConnect</span>
            </Link>
          </div>

          {/* Navigation principale */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.filter(shouldShowItem).map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="block relative"
                >
                  <div
                    className={`flex items-center space-x-3 px-4 py-3 transition-all relative ${active
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-teal-100 hover:bg-white/5 hover:text-white'
                      } rounded-lg`}
                  >
                    <item.icon className={`text-lg ${active ? 'text-white' : 'text-teal-200'}`} />
                    <span>{item.label}</span>
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-teal-600/30 mx-4"></div>

          {/* Bottom menu */}
          <div className="p-4 space-y-1">
            {bottomMenuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${active
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-teal-100 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon className={`text-lg ${active ? 'text-white' : 'text-teal-200'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-teal-100 hover:bg-red-500/20 hover:text-white transition-all"
            >
              <FiLogOut className="text-lg" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}