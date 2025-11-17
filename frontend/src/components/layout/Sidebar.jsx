import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiTruck, FiFileText, FiBarChart2,
  FiUsers, FiMessageSquare, FiSettings,
  FiHelpCircle, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout, isConcessionnaire, isAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
    { path: '/vehicles', icon: FiTruck, label: 'Véhicules', roles: ['all'] },
    { path: '/rentals', icon: FiFileText, label: 'Locations', roles: ['all'] },
    { path: '/analytics', icon: FiBarChart2, label: 'Statistiques', roles: ['CONCESSIONNAIRE', 'ADMINISTRATEUR'] },
    { path: '/dealers', icon: FiUsers, label: 'Concessionnaires', roles: ['ADMINISTRATEUR'] },
    { path: '/messages', icon: FiMessageSquare, label: 'Messages', roles: ['all'] },
  ];

  const bottomMenuItems = [
    { path: '/settings', icon: FiSettings, label: 'Paramètres' },
    { path: '/help', icon: FiHelpCircle, label: 'Centre d\'aide' },
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
          }  w-60 shadow-2xl`}
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
                      ? 'text-teal-700 font-semibold'
                      : 'text-teal-100 hover:text-white'
                      }`}
                    style={{ overflow: 'visible' }}
                  >
                    {/* Fond arrondi blanc pour l'item actif - ÉTENDU AU MAXIMUM */}
                    {active && (
                      <div
                        className="absolute inset-y-0 bg-gray-100 rounded-l-full shadow-lg z-0"
                        style={{
                          left: '0px',
                          right: 'Opx',  // Déborde de 32px vers la droite
                          width: 'calc(100% + 16px)'
                        }}
                      />
                    )}

                    {/* Icône et texte */}
                    <item.icon className={`w-5 h-5 relative z-10 ${active ? 'text-teal-700' : ''}`} />
                    <span className="text-sm relative z-10">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>


          {/* Section Upgrade (pour concessionnaires) */}
          {isConcessionnaire() && (
            <div className="p-4 mx-4 mb-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl text-white shadow-xl">
              <h3 className="font-semibold text-sm mb-2">Upgrade to Pro</h3>
              <p className="text-xs text-gray-300 mb-3">
                Accédez à des fonctionnalités premium
              </p>
              <button className="w-full py-2 px-4 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition shadow-md">
                Upgrade
              </button>
            </div>
          )}

          {/* Navigation secondaire */}
          {/* Navigation secondaire */}
<div className="p-4 space-y-1 border-t border-teal-600/30">
  {bottomMenuItems.map((item) => {
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        className="block relative"
      >
        <div
          className={`flex items-center space-x-3 px-4 py-3 transition-all relative ${
            active
              ? 'text-teal-700 font-semibold'
              : 'text-teal-100 hover:text-white'
          }`}
          style={{ overflow: 'visible' }}
        >
          {/* Fond arrondi pour l'item actif - MÊME STYLE QUE NAVIGATION PRINCIPALE */}
          {active && (
            <div
              className="absolute inset-y-0 bg-gray-100 rounded-l-full shadow-lg z-0"
              style={{
                left: '0px',
                right: '0px',
                width: 'calc(100% + 16px)'
              }}
            />
          )}

          {/* Icône et texte */}
          <item.icon className={`w-5 h-5 relative z-10 ${active ? 'text-teal-700' : ''}`} />
          <span className="text-sm relative z-10">{item.label}</span>
        </div>
      </Link>
    );
  })}

  {/* Bouton Déconnexion (sans effet de sélection) */}
  <button
    onClick={handleLogout}
    className="flex items-center space-x-3 px-4 py-3 text-teal-100 hover:text-white transition-all w-full text-left rounded-lg hover:bg-white/10"
  >
    <FiLogOut className="w-5 h-5" />
    <span className="text-sm">Déconnexion</span>
  </button>
</div>
        </div>
      </aside>
    </>
  );
}