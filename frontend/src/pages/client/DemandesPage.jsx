import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import demandeService from '../../services/demandeService';
import {
    FiMessageSquare, FiClock, FiCheckCircle, FiXCircle,
    FiAlertCircle, FiEye, FiCalendar, FiFileText, FiInfo
} from 'react-icons/fi';

export default function DemandesPage() {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtreStatut, setFiltreStatut] = useState('TOUTES');

    useEffect(() => {
        loadDemandes();
    }, []);

    const loadDemandes = async () => {
        try {
            setLoading(true);

            const data = await demandeService.getMesDemandes();

            // ✅ CORRECTION : Extraire le tableau
            const demandesArray = Array.isArray(data)
                ? data
                : (data.results || []);

            setDemandes(demandesArray);
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les demandes selon le statut
    const demandesFiltrees = demandes.filter(demande => {
        if (filtreStatut === 'TOUTES') return true;
        return demande.statut === filtreStatut;
    });

    // Compter les demandes par statut
    const compteurs = {
        TOUTES: demandes.length,
        EN_ATTENTE: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
        EN_COURS: demandes.filter(d => d.statut === 'EN_COURS').length,
        TRAITEE: demandes.filter(d => d.statut === 'TRAITEE').length,
        ANNULEE: demandes.filter(d => d.statut === 'ANNULEE').length,
    };

    // Fonction pour formater la date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Fonction pour obtenir le badge de statut
    const getBadgeStatut = (statut) => {
        const badges = {
            EN_ATTENTE: {
                icon: FiClock,
                text: 'En attente',
                className: 'bg-yellow-100 text-yellow-800'
            },
            EN_COURS: {
                icon: FiAlertCircle,
                text: 'En cours',
                className: 'bg-blue-100 text-blue-800'
            },
            TRAITEE: {
                icon: FiCheckCircle,
                text: 'Traitée',
                className: 'bg-green-100 text-green-800'
            },
            ANNULEE: {
                icon: FiXCircle,
                text: 'Annulée',
                className: 'bg-red-100 text-red-800'
            }
        };

        const badge = badges[statut] || badges.EN_ATTENTE;
        const IconComponent = badge.icon;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
                <IconComponent className="w-4 h-4" />
                <span>{badge.text}</span>
            </span>
        );
    };

    // Fonction pour obtenir l'icône du type de demande
    const getIconeType = (type) => {
        const icones = {
            CONTACT: FiMessageSquare,
            ESSAI: FiCalendar,
            DEVIS: FiFileText,
            INFORMATION: FiInfo
        };
        return icones[type] || FiMessageSquare;
    };

    // Fonction pour obtenir le libellé du type
    const getLibelleType = (type) => {
        const libelles = {
            CONTACT: 'Contact',
            ESSAI: 'Essai routier',
            DEVIS: 'Demande de devis',
            INFORMATION: 'Information'
        };
        return libelles[type] || type;
    };

    return (
        <DashboardLayout title="Mes demandes">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
                <p className="text-gray-600 mt-1">
                    Suivez l'état de vos demandes de contact et devis
                </p>
            </div>

            {/* Filtres par onglets */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6 overflow-x-auto">
                        {['TOUTES', 'EN_ATTENTE', 'EN_COURS', 'TRAITEE', 'ANNULEE'].map((statut) => (
                            <button
                                key={statut}
                                onClick={() => setFiltreStatut(statut)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${filtreStatut === statut
                                    ? 'border-teal-600 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {statut === 'TOUTES' ? 'Toutes' :
                                    statut === 'EN_ATTENTE' ? 'En attente' :
                                        statut === 'EN_COURS' ? 'En cours' :
                                            statut === 'TRAITEE' ? 'Traitées' : 'Annulées'}
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    {compteurs[statut]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contenu */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-red-800">Erreur</h3>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                </div>
            ) : demandesFiltrees.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {filtreStatut === 'TOUTES'
                            ? 'Aucune demande'
                            : `Aucune demande ${filtreStatut.toLowerCase().replace('_', ' ')}`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Parcourez notre catalogue pour contacter des concessionnaires
                    </p>
                    <Link
                        to="/vehicules"
                        className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Voir les véhicules
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {demandesFiltrees.map((demande) => {
                        const IconeType = getIconeType(demande.type_demande);

                        return (
                            <div
                                key={demande.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                            >
                                <div className="p-6">
                                    {/* En-tête */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <IconeType className="w-6 h-6 text-teal-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                        {demande.objet}
                                                    </h3>
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                        {getLibelleType(demande.type_demande)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {demande.vehicule?.nom_complet || 'Demande générale'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Envoyée le {formatDate(demande.date_creation)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            {getBadgeStatut(demande.statut)}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="mb-4">
                                        <p className="text-gray-700 text-sm line-clamp-2">
                                            {demande.message}
                                        </p>
                                    </div>

                                    {/* Réponse si disponible */}
                                    {demande.reponse && (
                                        <div className="bg-teal-50 border-l-4 border-teal-600 p-4 mb-4">
                                            <div className="flex items-start space-x-3">
                                                <FiMessageSquare className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-teal-900 text-sm mb-1">
                                                        Réponse du concessionnaire
                                                    </h4>
                                                    <p className="text-teal-800 text-sm">
                                                        {demande.reponse}
                                                    </p>
                                                    {demande.date_reponse && (
                                                        <p className="text-xs text-teal-600 mt-2">
                                                            Répondu le {formatDate(demande.date_reponse)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Informations concessionnaire */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>Concessionnaire: {demande.concessionnaire?.nom_entreprise || 'Non spécifié'}</span>
                                            {demande.vehicule && (
                                                <Link
                                                    to={`/vehicules/${demande.vehicule.id}`}
                                                    className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                    <span>Voir le véhicule</span>
                                                </Link>
                                            )}
                                        </div>

                                        {/* Bouton Annuler si en attente */}
                                        {demande.statut === 'EN_ATTENTE' && (
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Voulez-vous vraiment annuler cette demande ?')) {
                                                        try {
                                                            await demandeService.annulerDemande(demande.id);
                                                            loadDemandes();
                                                        } catch (err) {
                                                            alert(err.message);
                                                        }
                                                    }
                                                }}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Annuler
                                            </button>
                                        )}
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