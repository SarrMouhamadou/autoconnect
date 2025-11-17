import { Link, useLocation } from 'react-router-dom';
import {
    FiHome, FiCar, FiFileText, FiBarChart2,
    FiUsers, FiMessageSquare, FiSettings,
    FiHelpCircle, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { user, logout, isConcessionnaire, isAdmin } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
        { path: '/vehicles', icon: FiCar, label: 'Véhicules', roles: ['all'] },
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

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 w-64`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200">
                        <Link to="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-800 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">AutoConnect</span>
                        </Link>
                    </div>

                    {/* Navigation principale */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {menuItems.filter(shouldShowItem).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Section Upgrade (pour concessionnaires) */}
                    {isConcessionnaire() && (
                        <div className="p-4 mx-4 mb-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl text-white">
                            <h3 className="font-semibold text-sm mb-2">Upgrade to Pro</h3>
                            <p className="text-xs text-gray-300 mb-3">
                                Accédez à des fonctionnalités premium
                            </p>
                            <button className="w-full py-2 px-4 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                                Upgrade
                            </button>
                        </div>
                    )}

                    {/* Navigation secondaire */}
                    <div className="p-4 space-y-1 border-t border-gray-200">
                        {bottomMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        ))}

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                        >
                            <FiLogOut className="w-5 h-5" />
                            <span className="font-medium text-sm">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}