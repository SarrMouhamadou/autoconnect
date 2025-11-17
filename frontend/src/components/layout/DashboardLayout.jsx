import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Couleur de fond selon la page
  const getBackgroundColor = () => {
    if (location.pathname === '/dashboard') return 'bg-gray-50';
    if (location.pathname === '/settings') return 'bg-teal-50/30';
    if (location.pathname === '/vehicles') return 'bg-blue-50/30';
    return 'bg-gray-50';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getBackgroundColor()}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-60' : 'ml-0'
          }`}
      >
        <DashboardHeader
          onMenuClick={toggleSidebar}
          title={title}
          sidebarOpen={sidebarOpen}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Bordure colorée à gauche */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-teal-700 rounded-r-full" />

          <div className="relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}