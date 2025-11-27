import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import historiqueService from '../../services/historiqueService';
import {
    FiEye, FiClock, FiAlertCircle, FiCalendar,
    FiMessageSquare, FiFileText, FiTrendingUp
} from 'react-icons/fi';

export default function HistoriquePage() {
    const [historique, setHistorique] = useState([]);
    const [statistiques, setStatistiques] = useState(null);  
    const [filtreType, setFiltreType] = useState('TOUS');    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtreActif, setFiltreActif] = useState('TOUS');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const [historiqueData, statsData] = await Promise.all([
                historiqueService.getMonHistorique(),
                historiqueService.getStatistiques()
            ]);

            // ✅ CORRECTION ICI : Extraire le tableau
            const historiqueArray = Array.isArray(historiqueData)
                ? historiqueData
                : (historiqueData.results || []);

            setHistorique(historiqueArray);
            setStats(statsData);
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filtrer l'historique par type
    const historiqueFiltree = historique.filter(action => {
        if (filtreType === 'TOUS') return true;
        return action.type_action === filtreType;
    });

    // Compter les actions par type
    const compteurs = {
        TOUS: historique.length,
        CONSULTATION_VEHICULE: historique.filter(a => a.type_action === 'CONSULTATION_VEHICULE').length,
        AJOUT_FAVORI: historique.filter(a => a.type_action === 'AJOUT_FAVORI').length,
        DEMANDE_CONTACT: historique.filter(a => a.type_action === 'DEMANDE_CONTACT').length,
        RESERVATION: historique.filter(a => a.type_action === 'RESERVATION').length,
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // différence en secondes

        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;

        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getIconeAction = (type) => {
        const icones = {
            CONSULTATION_VEHICULE: FiEye,
            AJOUT_FAVORI: FiMessageSquare,
            DEMANDE_CONTACT: FiFileText,
            RESERVATION: FiCalendar,
        };
        return icones[type] || FiClock;
    };

    const getLibelleAction = (type) => {
        const libelles = {
            CONSULTATION_VEHICULE: 'Consultation de véhicule',
            AJOUT_FAVORI: 'Ajout aux favoris',
            DEMANDE_CONTACT: 'Demande de contact',
            RESERVATION: 'Réservation',
            RETRAIT_FAVORI: 'Retrait des favoris',
            ANNULATION_DEMANDE: 'Annulation de demande',
        };
        return libelles[type] || type;
    };

    const getCouleurAction = (type) => {
        const couleurs = {
            CONSULTATION_VEHICULE: 'bg-blue-100 text-blue-600',
            AJOUT_FAVORI: 'bg-red-100 text-red-600',
            DEMANDE_CONTACT: 'bg-purple-100 text-purple-600',
            RESERVATION: 'bg-green-100 text-green-600',
        };
        return couleurs[type] || 'bg-gray-100 text-gray-600';
    };

    return (
        <DashboardLayout title="Mon historique">
            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mon historique</h1>
                <p className="text-gray-600 mt-1">
                    Consultez votre historique d'activité sur la plateforme
                </p>
            </div>

            {/* Statistiques */}
            {!loading && statistiques && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total d'actions</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {statistiques.total_actions}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">7 derniers jours</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {statistiques.actions_7_derniers_jours}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiClock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Véhicules consultés</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {statistiques.vehicules_consultes}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FiEye className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Demandes envoyées</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {compteurs.DEMANDE_CONTACT}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiMessageSquare className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6 overflow-x-auto">
                        {['TOUS', 'CONSULTATION_VEHICULE', 'AJOUT_FAVORI', 'DEMANDE_CONTACT', 'RESERVATION'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFiltreType(type)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${filtreType === type
                                    ? 'border-teal-600 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {type === 'TOUS' ? 'Toutes' :
                                    type === 'CONSULTATION_VEHICULE' ? 'Consultations' :
                                        type === 'AJOUT_FAVORI' ? 'Favoris' :
                                            type === 'DEMANDE_CONTACT' ? 'Demandes' : 'Réservations'}
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    {compteurs[type]}
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
            ) : historiqueFiltree.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune activité
                    </h3>
                    <p className="text-gray-600">
                        Votre historique apparaîtra ici au fur et à mesure de vos actions
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md">
                    <div className="divide-y divide-gray-200">
                        {historiqueFiltree.map((action) => {
                            const IconeAction = getIconeAction(action.type_action);

                            return (
                                <div
                                    key={action.id}
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start space-x-4">
                                        {/* Icône */}
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCouleurAction(action.type_action)}`}>
                                            <IconeAction className="w-5 h-5" />
                                        </div>

                                        {/* Contenu */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {getLibelleAction(action.type_action)}
                                                    </p>
                                                    {action.vehicule && (
                                                        <Link
                                                            to={`/vehicules/${action.vehicule.id}`}
                                                            className="text-sm text-teal-600 hover:text-teal-700 hover:underline mt-1 inline-block"
                                                        >
                                                            {action.vehicule.nom_complet}
                                                        </Link>
                                                    )}
                                                    {action.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {action.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                    {formatDate(action.date_action)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}