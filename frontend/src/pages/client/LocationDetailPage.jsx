import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiCalendar,
    FiClock,
    FiTruck,
    FiMapPin,
    FiDollarSign,
    FiFileText,
    FiDownload,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiArrowLeft,
    FiPhone,
    FiMail,
    FiUser
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import locationService from '../../services/locationService';

export default function LocationDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadLocation();
    }, [id]);

    const loadLocation = async () => {
        try {
            setLoading(true);
            const data = await locationService.getLocation(id);
            setLocation(data);
            setError(null);
        } catch (err) {
            console.error('Erreur chargement location:', err);
            setError(err.message || 'Impossible de charger la location');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelLocation = async () => {
        if (!cancelReason.trim()) {
            alert('Veuillez indiquer une raison pour l\'annulation');
            return;
        }

        try {
            setCancelling(true);
            await locationService.annulerLocation(id, cancelReason);
            alert('Location annulée avec succès');
            await loadLocation();
            setShowCancelModal(false);
            setCancelReason('');
        } catch (err) {
            alert(err.message || 'Erreur lors de l\'annulation');
        } finally {
            setCancelling(false);
        }
    };

    const handleDownloadContract = async () => {
        try {
            await locationService.telechargerContrat(id);
        } catch (err) {
            alert(err.message || 'Erreur lors du téléchargement');
        }
    };

    const getStatutBadge = (statut) => {
        const config = {
            DEMANDE: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock, label: 'En attente de confirmation' },
            CONFIRMEE: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FiCheckCircle, label: 'Confirmée' },
            EN_COURS: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'En cours' },
            TERMINEE: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiCheckCircle, label: 'Terminée' },
            ANNULEE: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'Annulée' },
            REFUSEE: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'Refusée' },
        };

        const { bg, text, icon: Icon, label } = config[statut] || config.DEMANDE;

        return (
            <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${bg} ${text}`}>
                <Icon className="text-lg" />
                <span>{label}</span>
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDuree = (dateDebut, dateFin) => {
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const diffTime = Math.abs(fin - debut);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const canCancel = location && location.statut === 'DEMANDE';

    if (loading) {
        return (
            <DashboardLayout title="Chargement...">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des détails...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !location) {
        return (
            <DashboardLayout title="Erreur">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                        <FiAlertCircle className="text-red-500 text-2xl flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-red-800 text-lg">Erreur de chargement</h3>
                            <p className="text-red-700 mt-1">{error || 'Location introuvable'}</p>
                            <button
                                onClick={() => navigate('/client/locations')}
                                className="mt-4 text-sm font-medium text-red-600 hover:text-red-700 underline"
                            >
                                Retour à mes locations
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={`Location #${location.id}`}>
            {/* Bouton retour */}
            <button
                onClick={() => navigate('/client/locations')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition"
            >
                <FiArrowLeft />
                <span>Retour à mes locations</span>
            </button>

            {/* En-tête avec statut et actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {location.vehicule?.marque?.nom} {location.vehicule?.nom_modele}
                        </h1>
                        <p className="text-gray-600">Réservation #{location.id}</p>
                    </div>
                    {getStatutBadge(location.statut)}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    {location.contrat && (
                        <button
                            onClick={handleDownloadContract}
                            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                        >
                            <FiDownload />
                            <span>Télécharger le contrat</span>
                        </button>
                    )}

                    {canCancel && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                            <FiXCircle />
                            <span>Annuler la réservation</span>
                        </button>
                    )}

                    <Link
                        to={`/vehicules/${location.vehicule?.id}`}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                        <FiTruck />
                        <span>Voir le véhicule</span>
                    </Link>
                </div>
            </div>

            {/* Grille d'informations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Informations de location */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Informations de location</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date de début */}
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiCalendar className="text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Début de location</p>
                                <p className="font-medium text-gray-900">{formatDate(location.date_debut)}</p>
                                {location.heure_depart && (
                                    <p className="text-sm text-gray-600">à {location.heure_depart}</p>
                                )}
                            </div>
                        </div>

                        {/* Date de fin */}
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiCalendar className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Fin de location</p>
                                <p className="font-medium text-gray-900">{formatDate(location.date_fin)}</p>
                                {location.heure_retour && (
                                    <p className="text-sm text-gray-600">à {location.heure_retour}</p>
                                )}
                            </div>
                        </div>

                        {/* Durée */}
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiClock className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Durée totale</p>
                                <p className="font-medium text-gray-900">
                                    {getDuree(location.date_debut, location.date_fin)} jour(s)
                                </p>
                            </div>
                        </div>

                        {/* Concession */}
                        <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiMapPin className="text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Concession</p>
                                <p className="font-medium text-gray-900">{location.concession?.nom || 'Non spécifié'}</p>
                                <p className="text-sm text-gray-600">{location.concession?.ville}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes client */}
                    {location.notes_client && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="font-medium text-gray-900 mb-2">Vos notes</h3>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{location.notes_client}</p>
                        </div>
                    )}
                </div>

                {/* Résumé financier */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé financier</h2>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Prix par jour</span>
                            <span className="font-medium text-gray-900">
                                {parseInt(location.prix_jour || location.vehicule?.prix_location_jour || 0).toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Nombre de jours</span>
                            <span className="font-medium text-gray-900">
                                {getDuree(location.date_debut, location.date_fin)}
                            </span>
                        </div>

                        {location.reduction > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Réduction</span>
                                <span className="font-medium">
                                    -{parseInt(location.reduction).toLocaleString('fr-FR')} FCFA
                                </span>
                            </div>
                        )}

                        {location.caution && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Caution</span>
                                <span className="font-medium text-gray-900">
                                    {parseInt(location.caution).toLocaleString('fr-FR')} FCFA
                                </span>
                            </div>
                        )}

                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-teal-600">
                                    {parseInt(location.prix_total).toLocaleString('fr-FR')} FCFA
                                </span>
                            </div>
                        </div>
                    </div>

                    {location.code_promo && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                                <span className="font-medium">Code promo appliqué :</span> {location.code_promo}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Informations véhicule */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Détails du véhicule</h2>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    {location.vehicule?.photos?.[0] && (
                        <div className="md:w-64 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                                src={location.vehicule.photos[0].image}
                                alt={location.vehicule.nom_modele}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Caractéristiques */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Marque</p>
                            <p className="font-medium text-gray-900">{location.vehicule?.marque?.nom}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Modèle</p>
                            <p className="font-medium text-gray-900">{location.vehicule?.nom_modele}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Immatriculation</p>
                            <p className="font-medium text-gray-900">{location.vehicule?.immatriculation}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Catégorie</p>
                            <p className="font-medium text-gray-900">{location.vehicule?.categorie?.nom}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Transmission</p>
                            <p className="font-medium text-gray-900">{location.vehicule?.transmission}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Carburant</p>
                            <p className="font-medium text-gray-900">{location.vehicule?.type_carburant}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact concessionnaire */}
            {location.concessionnaire && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact concessionnaire</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start space-x-3">
                            <FiUser className="text-gray-400 text-lg mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Nom</p>
                                <p className="font-medium text-gray-900">
                                    {location.concessionnaire.prenom} {location.concessionnaire.nom}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <FiPhone className="text-gray-400 text-lg mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Téléphone</p>
                                <a
                                    href={`tel:${location.concessionnaire.telephone}`}
                                    className="font-medium text-teal-600 hover:text-teal-700"
                                >
                                    {location.concessionnaire.telephone}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <FiMail className="text-gray-400 text-lg mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <a
                                    href={`mailto:${location.concessionnaire.email}`}
                                    className="font-medium text-teal-600 hover:text-teal-700 break-all"
                                >
                                    {location.concessionnaire.email}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'annulation */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Annuler la réservation</h3>

                        <p className="text-gray-700 mb-4">
                            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Raison de l'annulation <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="Indiquez pourquoi vous annulez cette réservation..."
                            />
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                disabled={cancelling}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={handleCancelLocation}
                                disabled={cancelling || !cancelReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}