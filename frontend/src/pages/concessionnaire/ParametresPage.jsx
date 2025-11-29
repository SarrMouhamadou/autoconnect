import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import {
    FiBell, FiMail, FiMessageSquare,
    FiShield, FiEye, FiGlobe, FiSave
} from 'react-icons/fi';

export default function ParametresPage() {
    const { user } = useAuth();

    // États pour les paramètres
    const [preferences, setPreferences] = useState({
        // Notifications
        notifications_demandes: true,
        notifications_reservations: true,
        notifications_avis: true,
        notifications_maintenance: false,
        notifications_promotions: true,

        // Email
        email_nouvelles_demandes: true,
        email_confirmations: true,
        email_avis_clients: false,
        email_rappels: true,
        email_newsletter: false,

        // Confidentialité
        profil_public: true,
        afficher_telephone: true,
        afficher_email: false,

        // Langue et affichage
        langue: 'fr',
        theme: 'light',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Charger les paramètres depuis le backend
    useEffect(() => {
        loadParametres();
    }, []);

    const loadParametres = async () => {
        try {
            setLoading(true);
            const data = await authService.getParametres();
            setPreferences(data);
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres:', error);
            // En cas d'erreur, garder les valeurs par défaut
        } finally {
            setLoading(false);
        }
    };

    // Gérer les changements de paramètres
    const handleToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSelectChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Sauvegarder les paramètres dans le backend
    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveError(null);
            setSaveSuccess(false);

            await authService.updateParametres(preferences);

            setSaveSuccess(true);

            // Masquer le message après 3 secondes
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setSaveError(error.message || 'Erreur lors de la sauvegarde des paramètres');
        } finally {
            setSaving(false);
        }
    };

    // Afficher un loader pendant le chargement initial
    if (loading) {
        return (
            <DashboardLayout title="Paramètres">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des paramètres...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Paramètres">
            <div className="max-w-4xl mx-auto">

                {/* Messages de succès/erreur */}
                {saveSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                        <FiSave className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>Paramètres sauvegardés avec succès !</span>
                    </div>
                )}

                {saveError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {saveError}
                    </div>
                )}

                {/* Section Notifications */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center">
                            <FiBell className="w-5 h-5 text-teal-600 mr-3" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Notifications
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Gérez les notifications que vous souhaitez recevoir
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <ToggleItem
                            label="Nouvelles demandes"
                            description="Recevoir une notification pour chaque nouvelle demande"
                            checked={preferences.notifications_demandes}
                            onChange={() => handleToggle('notifications_demandes')}
                        />
                        <ToggleItem
                            label="Réservations"
                            description="Être notifié des nouvelles réservations"
                            checked={preferences.notifications_reservations}
                            onChange={() => handleToggle('notifications_reservations')}
                        />
                        <ToggleItem
                            label="Nouveaux avis"
                            description="Notification quand un client laisse un avis"
                            checked={preferences.notifications_avis}
                            onChange={() => handleToggle('notifications_avis')}
                        />
                        <ToggleItem
                            label="Alertes maintenance"
                            description="Rappels pour l'entretien des véhicules"
                            checked={preferences.notifications_maintenance}
                            onChange={() => handleToggle('notifications_maintenance')}
                        />
                        <ToggleItem
                            label="Promotions et conseils"
                            description="Conseils pour optimiser votre activité"
                            checked={preferences.notifications_promotions}
                            onChange={() => handleToggle('notifications_promotions')}
                        />
                    </div>
                </div>

                {/* Section Email */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center">
                            <FiMail className="w-5 h-5 text-teal-600 mr-3" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Notifications par email
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Choisissez les emails que vous souhaitez recevoir
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <ToggleItem
                            label="Nouvelles demandes"
                            description={`Envoyer à ${user?.email || 'votre email'}`}
                            checked={preferences.email_nouvelles_demandes}
                            onChange={() => handleToggle('email_nouvelles_demandes')}
                        />
                        <ToggleItem
                            label="Confirmations de réservation"
                            description="Recevoir un email pour chaque réservation confirmée"
                            checked={preferences.email_confirmations}
                            onChange={() => handleToggle('email_confirmations')}
                        />
                        <ToggleItem
                            label="Avis clients"
                            description="Email quand un client dépose un avis"
                            checked={preferences.email_avis_clients}
                            onChange={() => handleToggle('email_avis_clients')}
                        />
                        <ToggleItem
                            label="Rappels et alertes"
                            description="Rappels pour les tâches importantes"
                            checked={preferences.email_rappels}
                            onChange={() => handleToggle('email_rappels')}
                        />
                        <ToggleItem
                            label="Newsletter AutoConnect"
                            description="Actualités, conseils et nouveautés"
                            checked={preferences.email_newsletter}
                            onChange={() => handleToggle('email_newsletter')}
                        />
                    </div>
                </div>

                {/* Section Confidentialité */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center">
                            <FiShield className="w-5 h-5 text-teal-600 mr-3" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Confidentialité
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Contrôlez la visibilité de vos informations
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <ToggleItem
                            label="Profil public"
                            description="Permettre aux visiteurs de voir votre profil"
                            checked={preferences.profil_public}
                            onChange={() => handleToggle('profil_public')}
                        />
                        <ToggleItem
                            label="Afficher le téléphone"
                            description="Rendre votre numéro visible sur votre page"
                            checked={preferences.afficher_telephone}
                            onChange={() => handleToggle('afficher_telephone')}
                        />
                        <ToggleItem
                            label="Afficher l'email"
                            description="Rendre votre email visible publiquement"
                            checked={preferences.afficher_email}
                            onChange={() => handleToggle('afficher_email')}
                        />
                    </div>
                </div>

                {/* Section Langue et Affichage */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center">
                            <FiGlobe className="w-5 h-5 text-teal-600 mr-3" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Langue et affichage
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Personnalisez l'apparence de l'interface
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Langue */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Langue
                            </label>
                            <select
                                value={preferences.langue}
                                onChange={(e) => handleSelectChange('langue', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                                <option value="ar">العربية</option>
                                <option value="wo">Wolof</option>
                            </select>
                        </div>

                        {/* Thème */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thème
                            </label>
                            <select
                                value={preferences.theme}
                                onChange={(e) => handleSelectChange('theme', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="light">Clair</option>
                                <option value="dark">Sombre</option>
                                <option value="auto">Automatique (système)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Le thème sombre sera disponible prochainement
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bouton Sauvegarder */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSave className="w-5 h-5" />
                        <span>{saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}</span>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Composant Toggle réutilisable
function ToggleItem({ label, description, checked, onChange }) {
    return (
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{label}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${checked ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}