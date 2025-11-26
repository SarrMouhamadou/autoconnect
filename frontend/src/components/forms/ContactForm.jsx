import { useState } from 'react';
import { FiSend, FiUser, FiMail, FiPhone, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

export default function ContactForm({ concessionId, concessionName = "la concession" }) {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        sujet: 'DEMANDE_INFO',
        message: '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const sujets = [
        { value: 'DEMANDE_INFO', label: 'Demande d\'information' },
        { value: 'RESERVATION', label: 'Réservation' },
        { value: 'DEVIS', label: 'Demande de devis' },
        { value: 'AUTRE', label: 'Autre' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Réinitialiser les messages
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // TODO: Remplacer par l'endpoint réel de votre API
            const response = await axios.post('/api/demandes/', {
                ...formData,
                concession: concessionId,
                type_demande: 'CONTACT',
            });

            setSuccess(true);
            // Réinitialiser le formulaire
            setFormData({
                nom: '',
                email: '',
                telephone: '',
                sujet: 'DEMANDE_INFO',
                message: '',
            });

            // Masquer le message de succès après 5 secondes
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Une erreur est survenue. Veuillez réessayer.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <h3 className="text-xl font-bold">Contactez {concessionName}</h3>
                <p className="text-sm text-teal-50 mt-1">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Message de succès */}
                {success && (
                    <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        <FiCheckCircle className="text-2xl flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Message envoyé avec succès !</p>
                            <p className="text-sm text-green-700">Nous vous répondrons dans les plus brefs délais.</p>
                        </div>
                    </div>
                )}

                {/* Message d'erreur */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Nom complet */}
                <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            required
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Votre nom complet"
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-gray-400" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="votre.email@exemple.com"
                        />
                    </div>
                </div>

                {/* Téléphone */}
                <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            id="telephone"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            required
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="+221 XX XXX XX XX"
                        />
                    </div>
                </div>

                {/* Sujet */}
                <div>
                    <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="sujet"
                        name="sujet"
                        value={formData.sujet}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                        {sujets.map((sujet) => (
                            <option key={sujet.value} value={sujet.value}>
                                {sujet.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Message */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                            <FiMessageSquare className="text-gray-400" />
                        </div>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows="5"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                            placeholder="Décrivez votre demande en détail..."
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Minimum 10 caractères
                    </p>
                </div>

                {/* Bouton Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Envoi en cours...</span>
                        </>
                    ) : (
                        <>
                            <FiSend />
                            <span>Envoyer le message</span>
                        </>
                    )}
                </button>

                {/* Note de confidentialité */}
                <p className="text-xs text-gray-500 text-center">
                    Vos informations sont sécurisées et ne seront jamais partagées avec des tiers.
                </p>
            </form>
        </div>
    );
}