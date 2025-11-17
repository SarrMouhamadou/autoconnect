import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:pl-64">
                <DashboardHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    title={title}
                />

                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}