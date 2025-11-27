import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiCalendar,
    FiClock,
    FiTruck,
    FiMapPin,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiLoader,
    FiEye,
    FiDownload
} from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import locationService from '../../services/locationService';

export default function MesLocationsPage() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('TOUTES'); // TOUTES, EN_COURS, A_VENIR, PASSEES

    // Charger les locations
    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            setLoading(true);
            const data = await locationService.getMesLocations();
            setLocations(data.results || data);
            setError(null);
        } catch (err) {
            console.error('Erreur chargement locations:', err);
            setError(err.message || 'Impossible de charger les locations');
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les locations selon l'onglet actif
    const filteredLocations = locations.filter(location => {
        const now = new Date();
        const dateDebut = new Date(location.date_debut);
        const dateFin = new Date(location.date_fin);

        switch (activeTab) {
            case 'EN_COURS':
                return location.statut === 'EN_COURS' && dateDebut <= now && dateFin >= now;
            case 'A_VENIR':
                return ['DEMANDE', 'CONFIRMEE'].includes(location.statut) ||
                    (location.statut === 'EN_COURS' && dateDebut > now);
            case 'PASSEES':
                return location.statut === 'TERMINEE' || location.statut === 'ANNULEE' ||
                    (dateFin < now && !['DEMANDE', 'CONFIRMEE'].includes(location.statut));
            default:
                return true;
        }
    });

    // Fonction pour obtenir le badge de statut
    const getStatutBadge = (statut) => {
        const config = {
            DEMANDE: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock, label: 'En attente' },
            CONFIRMEE: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FiCheckCircle, label: 'Confirmée' },
            EN_COURS: { bg: 'bg-green-100', text: 'text-green-800', icon: FiLoader, label: 'En cours' },
            TERMINEE: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiCheckCircle, label: 'Terminée' },
            ANNULEE: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'Annulée' },
            REFUSEE: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'Refusée' },
        };

        const { bg, text, icon: Icon, label } = config[statut] || config.DEMANDE;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
                <Icon className="text-base" />
                <span>{label}</span>
            </span>
        );
    };

    // Formater les dates
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Calculer la durée en jours
    const getDuree = (dateDebut, dateFin) => {
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const diffTime = Math.abs(fin - debut);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Compter les locations par catégorie
    const counts = {
        TOUTES: locations.length,
        EN_COURS: locations.filter(l => {
            const now = new Date();
            const dateDebut = new Date(l.date_debut);
            const dateFin = new Date(l.date_fin);
            return l.statut === 'EN_COURS' && dateDebut <= now && dateFin >= now;
        }).length,
        A_VENIR: locations.filter(l => {
            const now = new Date();
            const dateDebut = new Date(l.date_debut);
            return ['DEMANDE', 'CONFIRMEE'].includes(l.statut) ||
                (l.statut === 'EN_COURS' && dateDebut > now);
        }).length,
        PASSEES: locations.filter(l => {
            const now = new Date();
            const dateFin = new Date(l.date_fin);
            return l.statut === 'TERMINEE' || l.statut === 'ANNULEE' ||
                (dateFin < now && !['DEMANDE', 'CONFIRMEE'].includes(l.statut));
        }).length,
    };

    return (
        <DashboardLayout title="Mes Locations">
            {/* Onglets de filtrage */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex space-x-8">
                    {[
                        { key: 'TOUTES', label: 'Toutes' },
                        { key: 'EN_COURS', label: 'En cours' },
                        { key: 'A_VENIR', label: 'À venir' },
                        { key: 'PASSEES', label: 'Passées' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.key
                                    ? 'border-teal-600 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {counts[tab.key]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* État de chargement */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement de vos locations...</p>
                    </div>
                </div>
            )}

            {/* Erreur */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <FiAlertCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-red-800">Erreur de chargement</h3>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                        <button
                            onClick={loadLocations}
                            className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            )}

            {/* Liste vide */}
            {!loading && !error && filteredLocations.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiTruck className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {activeTab === 'TOUTES' ? 'Aucune location' : `Aucune location ${activeTab.toLowerCase().replace('_', ' ')}`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {activeTab === 'TOUTES'
                            ? "Vous n'avez pas encore effectué de location."
                            : `Vous n'avez pas de location ${activeTab.toLowerCase().replace('_', ' ')}.`
                        }
                    </p>
                    <Link
                        to="/vehicules"
                        className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
                    >
                        <FiTruck className="mr-2" />
                        Parcourir les véhicules
                    </Link>
                </div>
            )}

            {/* Liste des locations */}
            {!loading && !error && filteredLocations.length > 0 && (
                <div className="space-y-4">
                    {filteredLocations.map(location => (
                        <div
                            key={location.id}
                            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition overflow-hidden"
                        >
                            <div className="flex flex-col lg:flex-row">
                                {/* Image du véhicule */}
                                <div className="lg:w-64 h-48 lg:h-auto bg-gray-200 flex-shrink-0">
                                    {location.vehicule?.photos?.[0] ? (
                                        <img
                                            src={location.vehicule.photos[0].image}
                                            alt={location.vehicule.nom_modele}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiTruck className="text-gray-400 text-4xl" />
                                        </div>
                                    )}
                                </div>

                                {/* Informations de la location */}
                                <div className="flex-1 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {location.vehicule?.marque?.nom} {location.vehicule?.nom_modele}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                Réservation #{location.id}
                                            </p>
                                        </div>
                                        {getStatutBadge(location.statut)}
                                    </div>

                                    {/* Détails de la location */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        {/* Dates */}
                                        <div className="flex items-start space-x-3">
                                            <FiCalendar className="text-gray-400 text-lg mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Période</p>
                                                <p className="font-medium text-gray-900">
                                                    {formatDate(location.date_debut)}
                                                </p>
                                                <p className="text-sm text-gray-600">au</p>
                                                <p className="font-medium text-gray-900">
                                                    {formatDate(location.date_fin)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Durée */}
                                        <div className="flex items-start space-x-3">
                                            <FiClock className="text-gray-400 text-lg mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Durée</p>
                                                <p className="font-medium text-gray-900">
                                                    {getDuree(location.date_debut, location.date_fin)} jour(s)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Lieu */}
                                        <div className="flex items-start space-x-3">
                                            <FiMapPin className="text-gray-400 text-lg mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Concession</p>
                                                <p className="font-medium text-gray-900">
                                                    {location.concession?.nom || 'Non spécifié'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {location.concession?.ville}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prix et actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div>
                                            <p className="text-sm text-gray-600">Prix total</p>
                                            <p className="text-2xl font-bold text-teal-600">
                                                {parseInt(location.prix_total).toLocaleString('fr-FR')} FCFA
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            {/* Télécharger contrat (si disponible) */}
                                            {location.contrat && (
                                                <button
                                                    onClick={() => locationService.telechargerContrat(location.id)}
                                                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                                >
                                                    <FiDownload />
                                                    <span>Contrat</span>
                                                </button>
                                            )}

                                            {/* Voir détails */}
                                            <Link
                                                to={`/client/locations/${location.id}`}
                                                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                                            >
                                                <FiEye />
                                                <span>Détails</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}