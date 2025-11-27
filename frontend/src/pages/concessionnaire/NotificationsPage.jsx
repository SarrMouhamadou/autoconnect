import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import notificationService from '../../services/notificationService';
import {
    FiBell, FiCheck, FiCheckCircle, FiAlertCircle,
    FiInfo, FiTrash2, FiSettings, FiUsers
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtreType, setFiltreType] = useState('TOUTES');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getMesNotifications();

            const notificationsArray = Array.isArray(data)
                ? data
                : (data.results || []);

            setNotifications(notificationsArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMarquerCommeLue = async (notificationId) => {
        try {
            await notificationService.marquerCommeLue(notificationId);
            loadNotifications();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleMarquerToutCommeLu = async () => {
        try {
            await notificationService.marquerToutCommeLu();
            loadNotifications();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSupprimer = async (notificationId) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette notification ?')) {
            try {
                await notificationService.supprimerNotification(notificationId);
                loadNotifications();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const notificationsFiltrees = Array.isArray(notifications)
        ? notifications.filter(notif => {
            if (filtreType === 'TOUTES') return true;
            if (filtreType === 'NON_LUES') return !notif.est_lue;
            return notif.type === filtreType;
        })
        : [];

    const compteurs = {
        TOUTES: notifications.length,
        NON_LUES: notifications.filter(n => !n.est_lue).length,
        NOUVELLE_DEMANDE: notifications.filter(n => n.type === 'NOUVELLE_DEMANDE').length,
        NOUVELLE_LOCATION: notifications.filter(n => n.type === 'NOUVELLE_LOCATION').length,
        NOUVEL_AVIS: notifications.filter(n => n.type === 'NOUVEL_AVIS').length,
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;

        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getIconeNotification = (type) => {
        const icones = {
            NOUVELLE_DEMANDE: FiInfo,
            NOUVELLE_LOCATION: FiCheckCircle,
            NOUVEL_AVIS: FiUsers,
            ALERTE_MAINTENANCE: FiAlertCircle,
            SYSTEME: FiBell,
        };
        return icones[type] || FiBell;
    };

    const getCouleurNotification = (type) => {
        const couleurs = {
            NOUVELLE_DEMANDE: 'bg-blue-100 text-blue-600',
            NOUVELLE_LOCATION: 'bg-green-100 text-green-600',
            NOUVEL_AVIS: 'bg-purple-100 text-purple-600',
            ALERTE_MAINTENANCE: 'bg-orange-100 text-orange-600',
            SYSTEME: 'bg-gray-100 text-gray-600',
        };
        return couleurs[type] || 'bg-gray-100 text-gray-600';
    };

    return (
        <DashboardLayout title="Notifications">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-1">
                            Restez informé de toutes vos activités
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {compteurs.NON_LUES > 0 && (
                            <button
                                onClick={handleMarquerToutCommeLu}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
                            >
                                <FiCheckCircle className="w-4 h-4" />
                                <span>Tout marquer comme lu</span>
                            </button>
                        )}
                        <Link
                            to="/concessionnaire/parametres"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Paramètres"
                        >
                            <FiSettings className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {!loading && notifications.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{compteurs.TOUTES}</p>
                            </div>
                            <FiBell className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Non lues</p>
                                <p className="text-2xl font-bold text-blue-600">{compteurs.NON_LUES}</p>
                            </div>
                            <FiBell className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Demandes</p>
                                <p className="text-2xl font-bold text-green-600">{compteurs.NOUVELLE_DEMANDE}</p>
                            </div>
                            <FiInfo className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Locations</p>
                                <p className="text-2xl font-bold text-purple-600">{compteurs.NOUVELLE_LOCATION}</p>
                            </div>
                            <FaCar className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avis</p>
                                <p className="text-2xl font-bold text-yellow-600">{compteurs.NOUVEL_AVIS}</p>
                            </div>
                            <FiUsers className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6 overflow-x-auto">
                        {['TOUTES', 'NON_LUES', 'NOUVELLE_DEMANDE', 'NOUVELLE_LOCATION', 'NOUVEL_AVIS'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFiltreType(type)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${filtreType === type
                                        ? 'border-teal-600 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {type === 'TOUTES' ? 'Toutes' :
                                    type === 'NON_LUES' ? 'Non lues' :
                                        type === 'NOUVELLE_DEMANDE' ? 'Demandes' :
                                            type === 'NOUVELLE_LOCATION' ? 'Locations' : 'Avis'}
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    {compteurs[type] || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 mt-2">{error}</p>
                </div>
            ) : notificationsFiltrees.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
                    <p className="text-gray-600">Vous êtes à jour !</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                    {notificationsFiltrees.map((notif) => {
                        const IconeNotif = getIconeNotification(notif.type);
                        return (
                            <div
                                key={notif.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${!notif.est_lue ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCouleurNotification(notif.type)
                                        }`}>
                                        <IconeNotif className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className={`font-medium ${!notif.est_lue ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                {notif.titre}
                                            </h3>
                                            {!notif.est_lue && (
                                                <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                                        <p className="text-xs text-gray-500">{formatDate(notif.date_creation)}</p>
                                        {notif.lien && (
                                            <Link
                                                to={notif.lien}
                                                className="inline-block mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                            >
                                                Voir plus →
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        {!notif.est_lue && (
                                            <button
                                                onClick={() => handleMarquerCommeLue(notif.id)}
                                                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                                title="Marquer comme lu"
                                            >
                                                <FiCheck className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSupprimer(notif.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Supprimer"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}