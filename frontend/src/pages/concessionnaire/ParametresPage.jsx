import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import {
    FiBell, FiMail, FiClock, FiDollarSign,
    FiCheck, FiAlertCircle, FiGlobe, FiSettings
} from 'react-icons/fi';

export default function ParametresPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Paramètres notifications
    const [notifications, setNotifications] = useState({
        nouvelles_demandes: true,
        nouvelles_locations: true,
        nouveaux_avis: true,
        alertes_maintenance: true,
        rappels: true,
        newsletter: false,
    });

    // Paramètres généraux
    const [parametresGeneraux, setParametresGeneraux] = useState({
        langue: 'fr',
        fuseau_horaire: 'Africa/Dakar',
        devise: 'FCFA',
        format_date: 'DD/MM/YYYY',
    });

    // Paramètres métier
    const [parametresMetier, setParametresMetier] = useState({
        auto_confirmation_locations: false,
        delai_reponse_demandes: '24', // heures
        activation_auto_promotions: true,
        affichage_prix_ttc: true,
    });

    useEffect(() => {
        loadParametres();
    }, []);

    const loadParametres = async () => {
        try {
            const data = await authService.getParametres();
            if (data.notifications) setNotifications(data.notifications);
            if (data.generaux) setParametresGeneraux(data.generaux);
            if (data.metier) setParametresMetier(data.metier);
        } catch (err) {
            console.error('Erreur chargement paramètres:', err);
        }
    };

    const handleSaveNotifications = async () => {
        try {
            setLoading(true);
            await authService.updateParametres({ notifications });
            setMessage({ type: 'success', text: 'Préférences de notifications enregistrées' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneraux = async () => {
        try {
            setLoading(true);
            await authService.updateParametres({ generaux: parametresGeneraux });
            setMessage({ type: 'success', text: 'Paramètres généraux enregistrés' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMetier = async () => {
        try {
            setLoading(true);
            await authService.updateParametres({ metier: parametresMetier });
            setMessage({ type: 'success', text: 'Paramètres métier enregistrés' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const NotificationToggle = ({ label, name, checked, onChange }) => (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-700">{label}</span>
            <button
                onClick={() => onChange(name, !checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-teal-600' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );

    return (
        <DashboardLayout title="Paramètres">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-gray-600 mt-1">
                    Gérez vos préférences et paramètres de votre compte concessionnaire
                </p>
            </div>

            {/* Message de confirmation */}
            {message && (
                <div
                    className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                        {message.text}
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <FiBell className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Notifications
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Choisissez les types de notifications que vous souhaitez recevoir
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-1 divide-y divide-gray-200">
                            <NotificationToggle
                                label="Nouvelles demandes de contact"
                                name="nouvelles_demandes"
                                checked={notifications.nouvelles_demandes}
                                onChange={(name, value) =>
                                    setNotifications({ ...notifications, [name]: value })
                                }
                            />
                            <NotificationToggle
                                label="Nouvelles réservations"
                                name="nouvelles_locations"
                                checked={notifications.nouvelles_locations}
                                onChange={(name, value) =>
                                    setNotifications({ ...notifications, [name]: value })
                                }
                            />
                            <NotificationToggle
                                label="Nouveaux avis clients"
                                name="nouveaux_avis"
                                checked={notifications.nouveaux_avis}
                                onChange={(name, value) =>
                                    setNotifications({ ...notifications, [name]: value })
                                }
                            />
                            <NotificationToggle
                                label="Alertes de maintenance véhicules"
                                name="alertes_maintenance"
                                checked={notifications.alertes_maintenance}
                                onChange={(name, value) =>
                                    setNotifications({ ...notifications, [name]: value })
                                }
                            />
                            <NotificationToggle
                                label="Rappels et échéances"
                                name="rappels"
                                checked={notifications.rappels}
                                onChange={(name, value) =>
                                    setNotifications({ ...notifications, [name]: value })
                                }
                            />
                            <NotificationToggle
                                label="Newsletter AutoConnect"
                                name="newsletter"
                                checked={notifications.newsletter}
                                onChange={(name, value) =>
                                    setNotifications({ ...notifications, [name]: value })
                                }
                            />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSaveNotifications}
                                disabled={loading}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Paramètres généraux */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <FiGlobe className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Paramètres généraux
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Langue, fuseau horaire et préférences d'affichage
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Langue
                                </label>
                                <select
                                    value={parametresGeneraux.langue}
                                    onChange={(e) =>
                                        setParametresGeneraux({
                                            ...parametresGeneraux,
                                            langue: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                    <option value="wo">Wolof</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fuseau horaire
                                </label>
                                <select
                                    value={parametresGeneraux.fuseau_horaire}
                                    onChange={(e) =>
                                        setParametresGeneraux({
                                            ...parametresGeneraux,
                                            fuseau_horaire: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="Africa/Dakar">Dakar (GMT)</option>
                                    <option value="Africa/Abidjan">Abidjan (GMT)</option>
                                    <option value="Europe/Paris">Paris (GMT+1)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Devise
                                </label>
                                <select
                                    value={parametresGeneraux.devise}
                                    onChange={(e) =>
                                        setParametresGeneraux({
                                            ...parametresGeneraux,
                                            devise: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="FCFA">FCFA</option>
                                    <option value="EUR">Euro (€)</option>
                                    <option value="USD">Dollar ($)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Format de date
                                </label>
                                <select
                                    value={parametresGeneraux.format_date}
                                    onChange={(e) =>
                                        setParametresGeneraux({
                                            ...parametresGeneraux,
                                            format_date: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSaveGeneraux}
                                disabled={loading}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Paramètres métier */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <FiSettings className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Paramètres métier
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Configuration spécifique à votre activité de location
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Confirmation automatique des locations
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Les réservations sont confirmées automatiquement sans validation manuelle
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setParametresMetier({
                                            ...parametresMetier,
                                            auto_confirmation_locations:
                                                !parametresMetier.auto_confirmation_locations,
                                        })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${parametresMetier.auto_confirmation_locations
                                            ? 'bg-teal-600'
                                            : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${parametresMetier.auto_confirmation_locations
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Délai de réponse aux demandes (heures)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="72"
                                    value={parametresMetier.delai_reponse_demandes}
                                    onChange={(e) =>
                                        setParametresMetier({
                                            ...parametresMetier,
                                            delai_reponse_demandes: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Temps maximum pour répondre aux demandes clients avant alerte
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Activation automatique des promotions
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Les promotions deviennent actives automatiquement à leur date de début
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setParametresMetier({
                                            ...parametresMetier,
                                            activation_auto_promotions:
                                                !parametresMetier.activation_auto_promotions,
                                        })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${parametresMetier.activation_auto_promotions
                                            ? 'bg-teal-600'
                                            : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${parametresMetier.activation_auto_promotions
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Affichage prix TTC</p>
                                    <p className="text-sm text-gray-600">
                                        Afficher les prix toutes taxes comprises
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setParametresMetier({
                                            ...parametresMetier,
                                            affichage_prix_ttc: !parametresMetier.affichage_prix_ttc,
                                        })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${parametresMetier.affichage_prix_ttc
                                            ? 'bg-teal-600'
                                            : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${parametresMetier.affichage_prix_ttc
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSaveMetier}
                                disabled={loading}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}