import { useState } from 'react';
import {
    FiMapPin,
    FiMail,
    FiPhone,
    FiCheckCircle,
    FiUsers,
    FiZap,
    FiTruck
} from 'react-icons/fi';

export default function VehiculeSidebar({ vehicule, onContactSubmit }) {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR').format(price);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (onContactSubmit) {
                await onContactSubmit(formData);
            }
            setSuccess(true);
            setFormData({ nom: '', email: '', telephone: '', message: '' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Carte prix et dealer */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                {/* Prix */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                    {vehicule.type_offre === 'VENTE' ? (
                        <>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                {formatPrice(vehicule.prix_vente)} FCFA
                            </div>
                            <div className="text-sm text-gray-500">Prix de vente</div>
                        </>
                    ) : vehicule.type_offre === 'LOCATION' ? (
                        <>
                            <div className="text-4xl font-bold text-gray-900 mb-1">
                                {formatPrice(vehicule.prix_journalier)} FCFA
                            </div>
                            <div className="text-sm text-gray-500">par jour</div>
                        </>
                    ) : (
                        <>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                {formatPrice(vehicule.prix_journalier)} FCFA/jour
                            </div>
                            <div className="text-xl text-gray-700">
                                ou {formatPrice(vehicule.prix_vente)} FCFA
                            </div>
                            <div className="text-sm text-gray-500 mt-1">Location ou vente</div>
                        </>
                    )}
                </div>

                {/* Dealer info */}
                {vehicule.concession && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-start space-x-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FiTruck className="text-blue-600 text-xl" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-bold text-gray-900">{vehicule.concession.nom}</h3>
                                    {vehicule.concession.statut === 'VALIDEE' && (
                                        <FiCheckCircle className="text-blue-600" />
                                    )}
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <FiMapPin className="text-gray-400" />
                                    <span>{vehicule.concession.ville}, {vehicule.concession.region}</span>
                                </div>
                            </div>
                        </div>

                        {vehicule.concession.telephone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                <FiPhone className="text-gray-400" />
                                <a
                                    href={`tel:${vehicule.concession.telephone}`}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {vehicule.concession.telephone}
                                </a>
                            </div>
                        )}

                        {vehicule.concession.email && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FiMail className="text-gray-400" />
                                <a
                                    href={`mailto:${vehicule.concession.email}`}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {vehicule.concession.email}
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <FiTruck className="text-gray-600" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Type</div>
                        <div className="font-semibold text-gray-900">
                            {vehicule.categorie?.nom || 'N/A'}
                        </div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <FiUsers className="text-gray-600" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Places</div>
                        <div className="font-semibold text-gray-900">
                            {vehicule.nombre_places} sièges
                        </div>
                    </div>

                    {vehicule.type_offre === 'VENTE' && vehicule.kilometrage && (
                        <div className="col-span-2 text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Kilométrage</div>
                            <div className="font-semibold text-gray-900">
                                {formatPrice(vehicule.kilometrage)} km
                            </div>
                        </div>
                    )}

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <FiZap className="text-gray-600" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Carburant</div>
                        <div className="font-semibold text-gray-900 text-sm">
                            {vehicule.type_carburant || 'N/A'}
                        </div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Année</div>
                        <div className="font-semibold text-gray-900">
                            {vehicule.annee}
                        </div>
                    </div>
                </div>

                {/* Formulaire de contact */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-4">Contactez le concessionnaire</h3>

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            Message envoyé avec succès !
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom complet *
                            </label>
                            <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Votre nom"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Téléphone *
                            </label>
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+221 XX XXX XX XX"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message (optionnel)
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Votre message..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Envoi...' : 'Envoyer la demande'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                        Le concessionnaire vous répondra dans les 24h
                    </p>
                </div>
            </div>
        </div>
    );
}