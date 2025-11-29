import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import locationService from '../../services/locationService';
import {
    FiClock, FiCheck, FiX, FiAlertCircle,
    FiCalendar, FiUser, FiMapPin,
    FiPhone, FiMail, FiFileText, FiTruck,
    FiEye, FiCheckCircle, FiXCircle, FiFilter
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function LocationsPage() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatut, setSelectedStatut] = useState('TOUS');
    const [searchTerm, setSearchTerm] = useState('');

    // Charger les locations depuis l'API
    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            setLoading(true);
            setError(null);
            // Utiliser uniquement l'API (pas de fallback)
            const data = await locationService.getLocationsRecues();

            // ✅ CORRECTION: Extraire results si réponse paginée
            if (data && data.results) {
                setLocations(data.results);  // Réponse paginée
            } else if (Array.isArray(data)) {
                setLocations(data);  // Réponse directe (tableau)
            } else {
                setLocations([]);  // Aucune donnée
            }
        } catch (error) {
            console.error('Erreur lors du chargement des locations:', error);
            setError(error.message || 'Impossible de charger les locations. Vérifiez que le backend est actif.');
            // PAS de fallback - tableau vide
            setLocations([]);
        } finally {
            setLoading(false);
        }
    };

    // Actions de gestion
    const handleConfirmer = async (locationId) => {
        if (!confirm('Confirmer cette location ?')) return;

        try {
            await locationService.confirmerLocation(locationId);
            // Recharger les locations
            loadLocations();
            alert('Location confirmée avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de la confirmation');
        }
    };

    const handleRefuser = async (locationId) => {
        const raison = prompt('Raison du refus :');
        if (!raison) return;

        try {
            await locationService.refuserLocation(locationId, raison);
            // Recharger les locations
            loadLocations();
            alert('Location refusée');
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors du refus');
        }
    };

    const handleDepart = async (locationId) => {
        const kilometrage = prompt('Kilométrage au départ :');
        if (!kilometrage) return;

        const etat = prompt('État du véhicule au départ :');

        try {
            await locationService.enregistrerDepart(locationId, {
                kilometrage_depart: parseInt(kilometrage),
                etat_depart: etat || 'Bon état'
            });
            // Recharger les locations
            loadLocations();
            alert('Départ enregistré avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de l\'enregistrement du départ');
        }
    };

    const handleRetour = async (locationId) => {
        const kilometrage = prompt('Kilométrage au retour :');
        if (!kilometrage) return;

        const etat = prompt('État du véhicule au retour :');

        try {
            await locationService.enregistrerRetour(locationId, {
                kilometrage_retour: parseInt(kilometrage),
                etat_retour: etat || 'Bon état'
            });
            // Recharger les locations
            loadLocations();
            alert('Retour enregistré avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de l\'enregistrement du retour');
        }
    };

    // Filtrer les locations
    const filteredLocations = locations.filter(location => {
        const matchStatut = selectedStatut === 'TOUS' || location.statut === selectedStatut;
        const matchSearch = searchTerm === '' ||
            location.numero_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${location.vehicule.marque} ${location.vehicule.modele}`.toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatut && matchSearch;
    });

    // Statistiques
    const stats = {
        total: locations.length,
        demandes: locations.filter(l => l.statut === 'DEMANDE').length,
        confirmees: locations.filter(l => l.statut === 'CONFIRMEE').length,
        en_cours: locations.filter(l => l.statut === 'EN_COURS').length,
        terminees: locations.filter(l => l.statut === 'TERMINEE').length,
        annulees: locations.filter(l => l.statut === 'ANNULEE').length,
    };

    // Formater les dates
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Config statuts
    const getStatutConfig = (statut) => {
        const configs = {
            DEMANDE: {
                label: 'En attente',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icon: FiClock,
                iconColor: 'text-yellow-600'
            },
            CONFIRMEE: {
                label: 'Confirmée',
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                icon: FiCheckCircle,
                iconColor: 'text-blue-600'
            },
            EN_COURS: {
                label: 'En cours',
                color: 'bg-purple-100 text-purple-800 border-purple-300',
                icon: FiTruck,
                iconColor: 'text-purple-600'
            },
            TERMINEE: {
                label: 'Terminée',
                color: 'bg-green-100 text-green-800 border-green-300',
                icon: FiCheck,
                iconColor: 'text-green-600'
            },
            ANNULEE: {
                label: 'Annulée',
                color: 'bg-red-100 text-red-800 border-red-300',
                icon: FiXCircle,
                iconColor: 'text-red-600'
            }
        };
        return configs[statut] || configs.DEMANDE;
    };

    if (loading) {
        return (
            <DashboardLayout title="Locations">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des locations...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestion des locations">
            {/* Message d'erreur */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <div className="flex items-start">
                        <FiAlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium mb-1">Impossible de charger les locations</p>
                            <p className="text-sm">{error}</p>
                            <p className="text-sm mt-2">
                                Vérifiez que le backend Django est actif sur <code className="bg-red-100 px-1 rounded">http://127.0.0.1:8000</code>
                            </p>
                        </div>
                        <button
                            onClick={loadLocations}
                            className="ml-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            )}

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <StatCard
                    label="Total"
                    value={stats.total}
                    icon={FiFileText}
                    color="bg-gray-100 text-gray-800"
                    active={selectedStatut === 'TOUS'}
                    onClick={() => setSelectedStatut('TOUS')}
                />
                <StatCard
                    label="En attente"
                    value={stats.demandes}
                    icon={FiClock}
                    color="bg-yellow-100 text-yellow-800"
                    active={selectedStatut === 'DEMANDE'}
                    onClick={() => setSelectedStatut('DEMANDE')}
                />
                <StatCard
                    label="Confirmées"
                    value={stats.confirmees}
                    icon={FiCheckCircle}
                    color="bg-blue-100 text-blue-800"
                    active={selectedStatut === 'CONFIRMEE'}
                    onClick={() => setSelectedStatut('CONFIRMEE')}
                />
                <StatCard
                    label="En cours"
                    value={stats.en_cours}
                    icon={FiTruck}
                    color="bg-purple-100 text-purple-800"
                    active={selectedStatut === 'EN_COURS'}
                    onClick={() => setSelectedStatut('EN_COURS')}
                />
                <StatCard
                    label="Terminées"
                    value={stats.terminees}
                    icon={FiCheck}
                    color="bg-green-100 text-green-800"
                    active={selectedStatut === 'TERMINEE'}
                    onClick={() => setSelectedStatut('TERMINEE')}
                />
                <StatCard
                    label="Annulées"
                    value={stats.annulees}
                    icon={FiXCircle}
                    color="bg-red-100 text-red-800"
                    active={selectedStatut === 'ANNULEE'}
                    onClick={() => setSelectedStatut('ANNULEE')}
                />
            </div>

            {/* Barre de recherche */}
            <div className="mb-6">
                <div className="relative">
                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher par numéro, client, véhicule..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            </div>

            {/* Liste des locations */}
            {filteredLocations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucune location trouvée
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Vous n\'avez pas encore de locations'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLocations.map((location) => (
                        <LocationCard
                            key={location.id}
                            location={location}
                            formatDate={formatDate}
                            formatDateTime={formatDateTime}
                            getStatutConfig={getStatutConfig}
                            onConfirmer={handleConfirmer}
                            onRefuser={handleRefuser}
                            onDepart={handleDepart}
                            onRetour={handleRetour}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

// Composant StatCard
function StatCard({ label, value, icon: Icon, color, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-lg border-2 transition ${active
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-transparent bg-white hover:border-gray-300'
                } shadow-sm`}
        >
            <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${active ? 'text-teal-600' : 'text-gray-400'}`} />
                <span className={`text-2xl font-bold ${active ? 'text-teal-600' : 'text-gray-900'}`}>
                    {value}
                </span>
            </div>
            <p className="text-sm text-gray-600">{label}</p>
        </button>
    );
}

// Composant LocationCard
function LocationCard({ location, formatDate, formatDateTime, getStatutConfig, onConfirmer, onRefuser, onDepart, onRetour }) {
    const [expanded, setExpanded] = useState(false);
    const config = getStatutConfig(location.statut);
    const IconStatut = config.icon;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {location.numero_location}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} flex items-center space-x-1`}>
                                <IconStatut className={`w-3 h-3 ${config.iconColor}`} />
                                <span>{config.label}</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Demande du {formatDate(location.date_demande)}
                        </p>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                        {expanded ? 'Réduire' : 'Voir détails'}
                    </button>
                </div>

                {/* Infos rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Client */}
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {location.client.prenom} {location.client.nom}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{location.client.email}</p>
                            <p className="text-xs text-gray-600">{location.client.telephone}</p>
                        </div>
                    </div>

                    {/* Véhicule */}
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaCar className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {location.vehicule.marque} {location.vehicule.modele}
                            </p>
                            <p className="text-xs text-gray-600">{location.vehicule.annee}</p>
                            <p className="text-xs text-gray-600 font-mono">{location.vehicule.immatriculation}</p>
                        </div>
                    </div>

                    {/* Période */}
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiCalendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {location.duree_jours} jour{location.duree_jours > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-600">
                                Du {formatDate(location.date_debut)}
                            </p>
                            <p className="text-xs text-gray-600">
                                Au {formatDate(location.date_fin)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Prix */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Montant total</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {location.prix_total.toLocaleString()} FCFA
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Caution</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {location.caution.toLocaleString()} FCFA
                        </p>
                    </div>
                </div>
            </div>

            {/* Détails étendus */}
            {expanded && (
                <div className="p-6 bg-gray-50 space-y-4">
                    {/* Concession */}
                    <div className="flex items-center space-x-3">
                        <FiMapPin className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Concession</p>
                            <p className="text-sm text-gray-600">{location.concession.nom}</p>
                        </div>
                    </div>

                    {/* Message client */}
                    {location.message_client && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900 mb-2">Message du client</p>
                            <p className="text-sm text-blue-800">{location.message_client}</p>
                        </div>
                    )}

                    {/* Informations de départ */}
                    {location.date_depart_reel && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-purple-900 mb-2">Départ effectué</p>
                            <p className="text-sm text-purple-800">
                                Le {formatDateTime(location.date_depart_reel)} - Km: {location.kilometrage_depart}
                            </p>
                        </div>
                    )}

                    {/* Informations de retour */}
                    {location.date_retour_reel && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-green-900 mb-2">Retour effectué</p>
                            <p className="text-sm text-green-800">
                                Le {formatDateTime(location.date_retour_reel)} - Km: {location.kilometrage_retour}
                            </p>
                            <p className="text-sm text-green-800 mt-1">
                                Distance parcourue: {location.kilometrage_retour - location.kilometrage_depart} km
                            </p>
                            {location.caution_restituee && (
                                <p className="text-sm text-green-800 mt-1 font-medium">
                                    ✓ Caution restituée
                                </p>
                            )}
                        </div>
                    )}

                    {/* Motif annulation */}
                    {location.statut === 'ANNULEE' && location.motif_annulation && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-red-900 mb-2">Annulée le {formatDate(location.date_annulation)}</p>
                            <p className="text-sm text-red-800">{location.motif_annulation}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                        {location.statut === 'DEMANDE' && (
                            <>
                                <button
                                    onClick={() => onConfirmer(location.id)}
                                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center space-x-2"
                                >
                                    <FiCheck className="w-4 h-4" />
                                    <span>Confirmer</span>
                                </button>
                                <button
                                    onClick={() => onRefuser(location.id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
                                >
                                    <FiX className="w-4 h-4" />
                                    <span>Refuser</span>
                                </button>
                            </>
                        )}
                        {location.statut === 'CONFIRMEE' && (
                            <button
                                onClick={() => onDepart(location.id)}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2"
                            >
                                <FiTruck className="w-4 h-4" />
                                <span>Enregistrer le départ</span>
                            </button>
                        )}
                        {location.statut === 'EN_COURS' && (
                            <button
                                onClick={() => onRetour(location.id)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                            >
                                <FiCheck className="w-4 h-4" />
                                <span>Enregistrer le retour</span>
                            </button>
                        )}
                        <Link
                            to={`/concessionnaire/locations/${location.id}`}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center justify-center space-x-2"
                        >
                            <FiEye className="w-4 h-4" />
                            <span>Détails complets</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}