export const dashboardData = {
    concessionnaire: {
        stats: {
            revenue: {
                value: 1250000,
                change: 12.5,
                trend: 'up',
                label: 'Revenus du mois'
            },
            activeVehicles: {
                value: 24,
                change: 3,
                trend: 'up',
                label: 'Véhicules actifs'
            },
            currentRentals: {
                value: 18,
                change: -2,
                trend: 'down',
                label: 'Locations en cours'
            },
            occupancyRate: {
                value: 75,
                change: 5,
                trend: 'up',
                label: 'Taux d\'occupation'
            }
        },

        revenueChart: [
            { month: 'Jan', revenue: 850000 },
            { month: 'Fév', revenue: 920000 },
            { month: 'Mar', revenue: 1100000 },
            { month: 'Avr', revenue: 980000 },
            { month: 'Mai', revenue: 1180000 },
            { month: 'Juin', revenue: 1050000 }
        ],

        recentRentals: [
            {
                id: 1,
                vehicle: {
                    name: 'Toyota Corolla 2023',
                    image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=100&h=100&fit=crop'
                },
                client: 'Aminata Diop',
                clientId: '#3456791',
                startDate: '2024-11-10',
                endDate: '2024-11-15',
                amount: 125000,
                status: 'En cours'
            },
            {
                id: 2,
                vehicle: {
                    name: 'Honda Civic 2022',
                    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=100&h=100&fit=crop'
                },
                client: 'Mamadou Ndiaye',
                clientId: '#3456792',
                startDate: '2024-11-08',
                endDate: '2024-11-12',
                amount: 95000,
                status: 'Terminée'
            },
            {
                id: 3,
                vehicle: {
                    name: 'Mercedes Classe C',
                    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=100&h=100&fit=crop'
                },
                client: 'Fatou Sall',
                clientId: '#3456793',
                startDate: '2024-11-20',
                endDate: '2024-11-25',
                amount: 185000,
                status: 'À venir'
            }
        ],

        upcomingEvents: [
            { date: '2024-11-17', type: 'pickup', client: 'Aminata Diop' },
            { date: '2024-11-19', type: 'return', client: 'Mamadou Ndiaye' },
            { date: '2024-11-20', type: 'pickup', client: 'Fatou Sall' },
            { date: '2024-11-21', type: 'maintenance', vehicle: 'Toyota Corolla' }
        ]
    },

    client: {
        stats: {
            activeRentals: {
                value: 1,
                change: 0,
                trend: 'neutral',
                label: 'Locations en cours'
            },
            totalRentals: {
                value: 12,
                change: 2,
                trend: 'up',
                label: 'Locations totales'
            },
            totalSpent: {
                value: 850000,
                change: 15000,
                trend: 'up',
                label: 'Montant dépensé'
            },
            favorites: {
                value: 5,
                change: 1,
                trend: 'up',
                label: 'Véhicules favoris'
            }
        },

        rentalHistory: [
            {
                id: 1,
                vehicle: {
                    name: 'Toyota Corolla 2023',
                    image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=100&h=100&fit=crop'
                },
                concessionnaire: 'Auto Prestige Dakar',
                startDate: '2024-10-15',
                endDate: '2024-10-20',
                amount: 125000,
                status: 'Terminée'
            }
        ]
    }
};

export const getCurrentMonth = () => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[new Date().getMonth()];
};

export const getCurrentYear = () => new Date().getFullYear();