import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import demandeService from '../../services/demandeService';
import {
    FiMail, FiPhone, FiCalendar, FiCheckCircle,
    FiXCircle, FiAlertCircle, FiClock, FiMessageSquare,
    FiUser, FiFilter, FiDownload
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';

export default function DemandesPage() {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtreStatut, setFiltreStatut] = useState('TOUTES');
    const [filtreType, setFiltreType] = useState('TOUS');
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseText, setResponseText] = useState('');

    useEffect(() => {
        loadDemandes();
    }, []);

    const loadDemandes = async () => {
        try {
            setLoading(true);
            const data = await demandeService.getDemandesRecues();

            const demandesArray = Array.isArray(data)
                ? data
                : (data.results || []);

            setDemandes(demandesArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRepondre = (demande) => {
        setSelectedDemande(demande);
        setShowResponseModal(true);
    };

    const handleSubmitResponse = async () => {
        if (!responseText.trim()) {
            alert('Veuillez saisir une réponse');
            return;
        }

        try {
            await demandeService.repondreDemande(selectedDemande.id, responseText);
            setShowResponseModal(false);
            setResponseText('');
            setSelectedDemande(null);
            loadDemandes();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleMarquerCommeLue = async (demandeId) => {
        try {
            await demandeService.marquerCommeLue(demandeId);
            loadDemandes();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleChangerStatut = async (demandeId, nouveauStatut) => {
        try {
            await demandeService.changerStatut(demandeId, nouveauStatut);
            loadDemandes();
        } catch (err) {
            alert(err.message);
        }
    };

    // Filtrer les demandes
    const demandesFiltrees = Array.isArray(demandes)
        ? demandes.filter(demande => {
            const matchStatut = filtreStatut === 'TOUTES' || demande.statut === filtreStatut;
            const matchType = filtreType === 'TOUS' || demande.type === filtreType;
            return matchStatut && matchType;
        })
        : [];

    // Statistiques
    const stats = {
        total: demandes.length,
        enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
        traitees: demandes.filter(d => d.statut === 'TRAITEE').length,
        contact: demandes.filter(d => d.type === 'CONTACT').length,
        essai: demandes.filter(d => d.type === 'ESSAI').length,
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'CONTACT': return FiMail;
            case 'ESSAI': return FaCar;
            case 'DEVIS': return FiMessageSquare;
            default: return FiMessageSquare;
        }
    };

    const getStatutBadge = (statut) => {
        const config = {
            EN_ATTENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock, label: 'En attente' },
            TRAITEE: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'Traitée' },
            ANNULEE: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'Annulée' },
        };

        const { bg, text, icon: Icon, label } = config[statut] || config.EN_ATTENTE;

        return (
            <span className={`inline-flex items-center space-x-1 px-2 py-1 ${bg} ${text} text-xs font-medium rounded`}>
                <Icon className="w-3 h-3" />
                <span>{label}</span>
            </span>
        );
    };

    const exporterCSV = () => {
        const headers = ['Date', 'Client', 'Type', 'Véhicule', 'Statut', 'Message'];
        const rows = demandesFiltrees.map(d => [
            formatDate(d.date_creation),
            d.client?.nom_complet || '',
            d.type,
            d.vehicule?.nom_complet || '',
            d.statut,
            d.message
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `demandes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <DashboardLayout title="Demandes reçues">
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Demandes reçues</h1>
                        <p className="text-gray-600 mt-1">
                            Gérez les demandes de contact et d'essai de vos clients
                        </p>
                    </div>
                    {demandesFiltrees.length > 0 && (
                        <button
                            onClick={exporterCSV}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
                        >
                            <FiDownload className="w-4 h-4" />
                            <span>Exporter CSV</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Statistiques */}
            {!loading && demandes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FiMessageSquare className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">En attente</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <FiClock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Traitées</p>
                                <p className="text-2xl font-bold text-green-600">{stats.traitees}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiCheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Contact</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.contact}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiMail className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Essais</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.essai}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FaCar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-gray-700">
                        <FiFilter className="w-5 h-5" />
                        <span className="font-medium">Filtres</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                value={filtreStatut}
                                onChange={(e) => setFiltreStatut(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="TOUTES">Toutes</option>
                                <option value="EN_ATTENTE">En attente</option>
                                <option value="TRAITEE">Traitées</option>
                                <option value="ANNULEE">Annulées</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <select
                                value={filtreType}
                                onChange={(e) => setFiltreType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="TOUS">Tous types</option>
                                <option value="CONTACT">Contact</option>
                                <option value="ESSAI">Demande d'essai</option>
                                <option value="DEVIS">Demande de devis</option>
                            </select>
                        </div>
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
                        Aucune demande
                    </h3>
                    <p className="text-gray-600">
                        Aucune demande ne correspond aux filtres sélectionnés
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {demandesFiltrees.map((demande) => {
                        const TypeIcon = getTypeIcon(demande.type);

                        return (
                            <div
                                key={demande.id}
                                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${!demande.est_lue ? 'border-l-4 border-teal-600' : ''
                                    }`}
                            >
                                {/* En-tête */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <TypeIcon className="w-6 h-6 text-teal-600" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {demande.type === 'CONTACT' ? 'Demande de contact' :
                                                        demande.type === 'ESSAI' ? 'Demande d\'essai' : 'Demande de devis'}
                                                </h3>
                                                {getStatutBadge(demande.statut)}
                                                {!demande.est_lue && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                        Nouveau
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <FiUser className="w-4 h-4" />
                                                    <span>{demande.client?.nom_complet || 'Client inconnu'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <FiPhone className="w-4 h-4" />
                                                    <span>{demande.client?.telephone || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <FiMail className="w-4 h-4" />
                                                    <span>{demande.client?.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <FiCalendar className="w-4 h-4" />
                                                    <span>{formatDate(demande.date_creation)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Véhicule concerné */}
                                {demande.vehicule && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <FaCar className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {demande.vehicule.nom_complet}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {demande.vehicule.prix_journalier?.toLocaleString('fr-FR')} FCFA/jour
                                                </p>
                                            </div>
                                            <Link
                                                to={`/concessionnaire/vehicules/${demande.vehicule.id}`}
                                                className="ml-auto text-teal-600 hover:text-teal-700 text-sm font-medium"
                                            >
                                                Voir véhicule →
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Message */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Message :</h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        {demande.message}
                                    </p>
                                </div>

                                {/* Dates pour essai */}
                                {demande.type === 'ESSAI' && demande.date_souhaitee && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-900">
                                            <strong>Date souhaitée :</strong> {formatDate(demande.date_souhaitee)}
                                        </p>
                                    </div>
                                )}

                                {/* Réponse du concessionnaire */}
                                {demande.reponse && (
                                    <div className="mb-4 p-4 bg-teal-50 border-l-4 border-teal-600 rounded">
                                        <h4 className="text-sm font-medium text-teal-900 mb-2">Votre réponse :</h4>
                                        <p className="text-teal-800 text-sm">{demande.reponse}</p>
                                        {demande.date_reponse && (
                                            <p className="text-xs text-teal-600 mt-2">
                                                Répondu le {formatDate(demande.date_reponse)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                                    {!demande.est_lue && (
                                        <button
                                            onClick={() => handleMarquerCommeLue(demande.id)}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                                        >
                                            Marquer comme lue
                                        </button>
                                    )}

                                    {demande.statut === 'EN_ATTENTE' && (
                                        <>
                                            <button
                                                onClick={() => handleRepondre(demande)}
                                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm"
                                            >
                                                Répondre
                                            </button>

                                            <button
                                                onClick={() => handleChangerStatut(demande.id, 'TRAITEE')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                            >
                                                Marquer traitée
                                            </button>

                                            <button
                                                onClick={() => handleChangerStatut(demande.id, 'ANNULEE')}
                                                className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition text-sm"
                                            >
                                                Annuler
                                            </button>
                                        </>
                                    )}

                                    <a
                                        href={`tel:${demande.client?.telephone}`}
                                        className="ml-auto px-4 py-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition text-sm flex items-center space-x-2"
                                    >
                                        <FiPhone className="w-4 h-4" />
                                        <span>Appeler</span>
                                    </a>

                                    <a
                                        href={`mailto:${demande.client?.email}`}
                                        className="px-4 py-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition text-sm flex items-center space-x-2"
                                    >
                                        <FiMail className="w-4 h-4" />
                                        <span>Email</span>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Réponse */}
            {showResponseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Répondre à la demande
                            </h3>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Client :</strong> {selectedDemande?.client?.nom_complet}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Type :</strong> {selectedDemande?.type}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Votre réponse
                                </label>
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Saisissez votre réponse au client..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowResponseModal(false);
                                    setResponseText('');
                                    setSelectedDemande(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmitResponse}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                            >
                                Envoyer la réponse
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}