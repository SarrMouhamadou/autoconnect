import { useState } from 'react';
import { FiMenu, FiSearch, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader({ onMenuClick, title = 'Dashboard' }) {
    const { user, isAdmin, isConcessionnaire, isClient } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    // ✅ Fonction pour déterminer le rôle à afficher
    const getRoleDisplay = () => {
        // Vérifier explicitement is_superuser et is_staff d'abord
        if (user?.is_superuser === true || user?.is_staff === true) {
            return 'Administrateur';
        }

        // Ensuite vérifier via les fonctions du contexte
        if (isAdmin()) {
            return 'Administrateur';
        }

        if (isConcessionnaire()) {
            return 'Concessionnaire';
        }

        if (isClient()) {
            return 'Client';
        }

        // Fallback sur type_utilisateur
        return user?.type_utilisateur?.toLowerCase() || 'Utilisateur';
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Menu + Title */}
                    <div className="flex items-center space-x-4">
                        {/* Hamburger pour mobile */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <FiMenu className="w-6 h-6 text-gray-700" />
                        </button>

                        {/* Hamburger pour desktop (nouveau) */}
                        <button
                            onClick={onMenuClick}
                            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition"
                            title="Masquer/Afficher le menu"
                        >
                            <FiMenu className="w-6 h-6 text-gray-700" />
                        </button>

                        <h1 className="text-2xl font-semibold text-gray-900 hidden sm:block">
                            {title}
                        </h1>
                    </div>

                    {/* Center: Search (hidden on mobile) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Right: Notifications + User */}
                    <div className="flex items-center space-x-4">
                        {/* Notification */}
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                            <FiBell className="w-6 h-6 text-gray-700" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Avatar */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
                                {user?.photo_profil ? (
                                    <img
                                        src={user.photo_profil}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-semibold text-sm">
                                        {user?.prenom?.[0]}{user?.nom?.[0]}
                                    </span>
                                )}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.prenom} {user?.nom}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {/* ✅ CORRECTION ICI - Utiliser getRoleDisplay() */}
                                    {getRoleDisplay()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}