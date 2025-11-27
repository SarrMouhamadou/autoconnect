import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiCalendar,
    FiClock,
    FiTruck,
    FiMapPin,
    FiAlertCircle,
    FiCheckCircle,
    FiDollarSign,
    FiInfo,
    FiArrowLeft
} from 'react-icons/fi';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import vehiculeService from '../../services/vehiculeService';
import locationService from '../../services/locationService';

export default function ReservationPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, isClient } = useAuth();

    const [vehicule, setVehicule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Formulaire
    const [formData, setFormData] = useState({
        date_debut: '',
        date_fin: '',
        heure_depart: '09:00',
        heure_retour: '18:00',
        code_promo: '',
        notes_client: ''
    });

    // Prix calculé
    const [prixCalcule, setPrixCalcule] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    // Vérifier l'authentification
    useEffect(() => {
        if (!isAuthenticated()) {
            // Rediriger vers la page de connexion avec returnUrl
            navigate(`/auth?returnUrl=/vehicules/${id}/reserver`);
        } else if (!isClient()) {
            // Seuls les clients peuvent réserver
            alert('Seuls les clients peuvent effectuer des réservations');
            navigate(`/vehicules/${id}`);
        }
    }, [isAuthenticated, isClient, id, navigate]);

    // Charger le véhicule
    useEffect(() => {
        if (isAuthenticated() && isClient()) {
            loadVehicule();
        }
    }, [id, isAuthenticated, isClient]);

    // Calculer le prix quand les dates changent
    useEffect(() => {
        if (formData.date_debut && formData.date_fin && vehicule) {
            calculatePrice();
        }
    }, [formData.date_debut, formData.date_fin, formData.code_promo, vehicule]);

    const loadVehicule = async () => {
        try {
            setLoading(true);
            const data = await vehiculeService.getVehicule(id);

            // Vérifier si le véhicule est disponible pour location
            if (!data.est_disponible_location) {
                setError('Ce véhicule n\'est pas disponible à la location');
            } else if (data.statut !== 'DISPONIBLE') {
                setError('Ce véhicule n\'est actuellement pas disponible');
            } else {
                setVehicule(data);
                setError(null);
            }
        } catch (err) {
            console.error('Erreur chargement véhicule:', err);
            setError(err.message || 'Impossible de charger le véhicule');
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = async () => {
        try {
            setCalculatingPrice(true);
            const result = await locationService.calculerPrix(
                id,
                formData.date_debut,
                formData.date_fin,
                formData.code_promo || null
            );
            setPrixCalcule(result);
        } catch (err) {
            console.error('Erreur calcul prix:', err);
            setPrixCalcule(null);
        } finally {
            setCalculatingPrice(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.date_debut || !formData.date_fin) {
            alert('Veuillez sélectionner les dates de location');
            return;
        }

        const dateDebut = new Date(formData.date_debut);
        const dateFin = new Date(formData.date_fin);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateDebut < today) {
            alert('La date de début ne peut pas être dans le passé');
            return;
        }

        if (dateFin <= dateDebut) {
            alert('La date de fin doit être après la date de début');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Créer la demande de location
            const locationData = {
                vehicule_id: parseInt(id),
                date_debut: formData.date_debut,
                date_fin: formData.date_fin,
                heure_depart: formData.heure_depart,
                heure_retour: formData.heure_retour,
                code_promo: formData.code_promo || null,
                notes_client: formData.notes_client || null
            };

            const result = await locationService.creerDemandeLocation(locationData);

            setSuccess(true);

            // Rediriger vers la page de détail de la location après 2 secondes
            setTimeout(() => {
                navigate(`/client/locations/${result.id}`);
            }, 2000);

        } catch (err) {
            console.error('Erreur création location:', err);
            setError(err.message || 'Une erreur est survenue lors de la réservation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getDuree = () => {
        if (!formData.date_debut || !formData.date_fin) return 0;
        const debut = new Date(formData.date_debut);
        const fin = new Date(formData.date_fin);
        const diffTime = Math.abs(fin - debut);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Date minimale = aujourd'hui
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Chargement...</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !vehicule) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-start space-x-3">
                                <FiAlertCircle className="text-red-500 text-2xl flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-red-800 text-lg">Erreur</h3>
                                    <p className="text-red-700 mt-1">{error || 'Véhicule introuvable'}</p>
                                    <Link
                                        to="/vehicules"
                                        className="mt-4 inline-block text-sm font-medium text-red-600 hover:text-red-700 underline"
                                    >
                                        Retour au catalogue
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Bouton retour */}
                    <Link
                        to={`/vehicules/${id}`}
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition"
                    >
                        <FiArrowLeft />
                        <span>Retour au véhicule</span>
                    </Link>

                    {/* Titre */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Réserver ce véhicule</h1>
                        <p className="text-gray-600">Complétez les informations ci-dessous pour effectuer votre réservation</p>
                    </div>

                    {/* Message de succès */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                            <FiCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-green-800">Réservation effectuée !</h3>
                                <p className="text-green-700 text-sm mt-1">
                                    Votre demande de location a été envoyée avec succès. Redirection en cours...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Erreur de soumission */}
                    {error && !success && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                            <FiAlertCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-red-800">Erreur</h3>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Formulaire de réservation */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Informations de réservation</h2>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date de début <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="date_debut"
                                            value={formData.date_debut}
                                            onChange={handleChange}
                                            min={getMinDate()}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date de fin <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="date_fin"
                                            value={formData.date_fin}
                                            onChange={handleChange}
                                            min={formData.date_debut || getMinDate()}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Heures */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Heure de départ
                                        </label>
                                        <input
                                            type="time"
                                            name="heure_depart"
                                            value={formData.heure_depart}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Heure de retour
                                        </label>
                                        <input
                                            type="time"
                                            name="heure_retour"
                                            value={formData.heure_retour}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Code promo */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Code promo (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        name="code_promo"
                                        value={formData.code_promo}
                                        onChange={handleChange}
                                        placeholder="Entrez votre code promo"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                                    />
                                    {prixCalcule?.reduction > 0 && (
                                        <p className="text-green-600 text-sm mt-2">
                                            ✓ Code promo appliqué ! Réduction de {parseInt(prixCalcule.reduction).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes ou demandes spéciales (optionnel)
                                    </label>
                                    <textarea
                                        name="notes_client"
                                        value={formData.notes_client}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Indiquez toute information utile pour votre réservation..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Bouton de soumission */}
                                <button
                                    type="submit"
                                    disabled={submitting || !formData.date_debut || !formData.date_fin || success}
                                    className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Envoi en cours...' : success ? 'Réservation effectuée !' : 'Confirmer la réservation'}
                                </button>
                            </form>
                        </div>

                        {/* Résumé */}
                        <div className="space-y-6">
                            {/* Carte véhicule */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {vehicule.photos?.[0] && (
                                    <img
                                        src={vehicule.photos[0].image}
                                        alt={vehicule.nom_modele}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">
                                        {vehicule.marque?.nom} {vehicule.nom_modele}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3">{vehicule.annee}</p>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Prix par jour</span>
                                        <span className="font-bold text-teal-600">
                                            {parseInt(vehicule.prix_location_jour).toLocaleString('fr-FR')} FCFA
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Récapitulatif prix */}
                            {formData.date_debut && formData.date_fin && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>

                                    {calculatingPrice ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                                            <p className="text-gray-600 text-sm mt-2">Calcul du prix...</p>
                                        </div>
                                    ) : prixCalcule ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Période</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatDate(formData.date_debut)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">au</span>
                                                <span className="font-medium text-gray-900">
                                                    {formatDate(formData.date_fin)}
                                                </span>
                                            </div>

                                            <div className="pt-3 border-t border-gray-200">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Prix par jour</span>
                                                    <span className="font-medium text-gray-900">
                                                        {parseInt(prixCalcule.prix_jour).toLocaleString('fr-FR')} FCFA
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm mt-2">
                                                    <span className="text-gray-600">Nombre de jours</span>
                                                    <span className="font-medium text-gray-900">{getDuree()}</span>
                                                </div>
                                            </div>

                                            {prixCalcule.reduction > 0 && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Réduction</span>
                                                    <span className="font-medium">
                                                        -{parseInt(prixCalcule.reduction).toLocaleString('fr-FR')} FCFA
                                                    </span>
                                                </div>
                                            )}

                                            {prixCalcule.caution && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Caution (remboursable)</span>
                                                    <span className="font-medium text-gray-900">
                                                        {parseInt(prixCalcule.caution).toLocaleString('fr-FR')} FCFA
                                                    </span>
                                                </div>
                                            )}

                                            <div className="pt-3 border-t border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-900">Total</span>
                                                    <span className="text-2xl font-bold text-teal-600">
                                                        {parseInt(prixCalcule.prix_total).toLocaleString('fr-FR')} FCFA
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-600">
                                            Sélectionnez les dates pour voir le prix
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Informations importantes */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <FiInfo className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-2">Informations importantes</p>
                                        <ul className="space-y-1 list-disc list-inside">
                                            <li>La réservation sera confirmée par le concessionnaire</li>
                                            <li>Vous recevrez une notification par email</li>
                                            <li>La caution sera restituée après le retour du véhicule</li>
                                            <li>Annulation gratuite avant confirmation</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}