import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    FiBell, FiMail, FiSmartphone, FiSave,
    FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';

export default function ParametresPage() {
    const [preferences, setPreferences] = useState({
        // Notifications par email
        email_nouvelles_offres: true,
        email_alertes_prix: true,
        email_confirmations: true,
        email_rappels: true,
        email_newsletter: false,

        // Notifications push
        push_nouvelles_offres: false,
        push_alertes_prix: true,
        push_confirmations: true,
        push_rappels: true,

        // Préférences de communication
        langue: 'fr',
        devise: 'FCFA',
        format_date: 'DD/MM/YYYY',
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Simuler un appel API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Sauvegarder dans localStorage (en attendant l'API)
            localStorage.setItem('user_preferences', JSON.stringify(preferences));

            setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout title="Paramètres">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-gray-600 mt-1">
                    Gérez vos préférences de notifications et de communication
                </p>
            </div>

            {/* Message de confirmation */}
            {message && (
                <div className={`mb-6 rounded-lg p-4 flex items-start space-x-3 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                        <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                            {message.text}
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Notifications par email */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiMail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Notifications par email
                            </h2>
                            <p className="text-sm text-gray-600">
                                Choisissez les emails que vous souhaitez recevoir
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Nouvelles offres</div>
                                <div className="text-sm text-gray-600">
                                    Recevez des emails sur les nouvelles offres de véhicules
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="email_nouvelles_offres"
                                checked={preferences.email_nouvelles_offres}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Alertes de prix</div>
                                <div className="text-sm text-gray-600">
                                    Soyez notifié des baisses de prix sur vos favoris
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="email_alertes_prix"
                                checked={preferences.email_alertes_prix}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Confirmations de réservation</div>
                                <div className="text-sm text-gray-600">
                                    Recevez des confirmations pour vos réservations
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="email_confirmations"
                                checked={preferences.email_confirmations}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Rappels</div>
                                <div className="text-sm text-gray-600">
                                    Recevez des rappels avant vos locations
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="email_rappels"
                                checked={preferences.email_rappels}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Newsletter</div>
                                <div className="text-sm text-gray-600">
                                    Recevez notre newsletter mensuelle
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="email_newsletter"
                                checked={preferences.email_newsletter}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Notifications push */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FiBell className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Notifications push
                            </h2>
                            <p className="text-sm text-gray-600">
                                Gérez vos notifications en temps réel
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Nouvelles offres</div>
                                <div className="text-sm text-gray-600">
                                    Notifications instantanées des nouvelles offres
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="push_nouvelles_offres"
                                checked={preferences.push_nouvelles_offres}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Alertes de prix</div>
                                <div className="text-sm text-gray-600">
                                    Notifications des baisses de prix
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="push_alertes_prix"
                                checked={preferences.push_alertes_prix}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Confirmations</div>
                                <div className="text-sm text-gray-600">
                                    Notifications de confirmation de réservation
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="push_confirmations"
                                checked={preferences.push_confirmations}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                            <div>
                                <div className="font-medium text-gray-900">Rappels</div>
                                <div className="text-sm text-gray-600">
                                    Notifications de rappel avant vos locations
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="push_rappels"
                                checked={preferences.push_rappels}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Préférences générales */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FiSmartphone className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Préférences générales
                            </h2>
                            <p className="text-sm text-gray-600">
                                Personnalisez votre expérience
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Langue
                            </label>
                            <select
                                name="langue"
                                value={preferences.langue}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                                <option value="wo">Wolof</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Devise
                            </label>
                            <select
                                name="devise"
                                value={preferences.devise}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                                name="format_date"
                                value={preferences.format_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                                <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                                <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bouton enregistrer */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Enregistrement...</span>
                            </>
                        ) : (
                            <>
                                <FiSave className="w-5 h-5" />
                                <span>Enregistrer les paramètres</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}