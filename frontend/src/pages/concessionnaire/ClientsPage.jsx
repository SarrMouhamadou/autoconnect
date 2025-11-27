import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import clientService from '../../services/clientService';
import {
    FiUser, FiMail, FiPhone, FiCalendar,
    FiMapPin, FiAlertCircle, FiStar, FiTrendingUp,
    FiDollarSign, FiFilter, FiSearch, FiDownload
} from 'react-icons/fi';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtreStatut, setFiltreStatut] = useState('TOUS');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientService.getMesClients();

            const clientsArray = Array.isArray(data)
                ? data
                : (data.results || []);

            setClients(clientsArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVoirDetails = (client) => {
        setSelectedClient(client);
        setShowDetailsModal(true);
    };

    // Filtrer et rechercher
    const clientsFiltres = Array.isArray(clients)
        ? clients.filter(client => {
            const matchSearch = client.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.telephone?.includes(searchTerm);

            const matchStatut = filtreStatut === 'TOUS' ||
                (filtreStatut === 'ACTIFS' && client.nombre_locations > 0) ||
                (filtreStatut === 'FIDELES' && client.nombre_locations >= 3) ||
                (filtreStatut === 'NOUVEAUX' && client.nombre_locations === 0);

            return matchSearch && matchStatut;
        })
        : [];

    // Statistiques
    const stats = {
        total: clients.length,
        actifs: clients.filter(c => c.nombre_locations > 0).length,
        fideles: clients.filter(c => c.nombre_locations >= 3).length,
        nouveaux: clients.filter(c => c.nombre_locations === 0).length,
        revenusTotal: clients.reduce((sum, c) => sum + (c.montant_total_depense || 0), 0),
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getBadgeStatut = (client) => {
        if (client.nombre_locations >= 5) {
            return (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                    VIP
                </span>
            );
        } else if (client.nombre_locations >= 3) {
            return (
                <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded">
                    Fidèle
                </span>
            );
        } else if (client.nombre_locations > 0) {
            return (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    Actif
                </span>
            );
        }
        return (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                Nouveau
            </span>
        );
    };

    const exporterCSV = () => {
        const headers = ['Nom', 'Email', 'Téléphone', 'Ville', 'Locations', 'Dépenses', 'Inscription'];
        const rows = clientsFiltres.map(c => [
            c.nom_complet,
            c.email,
            c.telephone,
            c.ville || 'N/A',
            c.nombre_locations,
            c.montant_total_depense || 0,
            formatDate(c.date_inscription)
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <DashboardLayout title="Mes clients">
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes clients</h1>
                        <p className="text-gray-600 mt-1">
                            Consultez et gérez votre base de clients
                        </p>
                    </div>
                    {clientsFiltres.length > 0 && (
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
            {!loading && clients.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total clients</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FiUser className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Clients actifs</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.actifs}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Clients fidèles</p>
                                <p className="text-2xl font-bold text-teal-600">{stats.fideles}</p>
                            </div>
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <FiStar className="w-6 h-6 text-teal-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Nouveaux</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.nouveaux}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FiUser className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Revenus total</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {Math.round(stats.revenusTotal / 1000)}k
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiDollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, email ou téléphone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <select
                                value={filtreStatut}
                                onChange={(e) => setFiltreStatut(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="TOUS">Tous les clients</option>
                                <option value="ACTIFS">Clients actifs</option>
                                <option value="FIDELES">Clients fidèles (3+ locations)</option>
                                <option value="NOUVEAUX">Nouveaux clients</option>
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
            ) : clientsFiltres.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun client trouvé
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'Aucun client ne correspond à votre recherche' : 'Vous n\'avez pas encore de clients'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Localisation
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Locations
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dépenses
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clientsFiltres.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold">
                                                    {client.nom_complet?.charAt(0) || 'C'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {client.nom_complet}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Depuis {formatDate(client.date_inscription)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{client.email}</div>
                                            <div className="text-sm text-gray-500">{client.telephone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <FiMapPin className="w-4 h-4 mr-1 text-gray-400" />
                                                {client.ville || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {client.nombre_locations || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-green-600">
                                                {Math.round(client.montant_total_depense || 0).toLocaleString('fr-FR')} FCFA
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getBadgeStatut(client)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleVoirDetails(client)}
                                                className="text-teal-600 hover:text-teal-900"
                                            >
                                                Voir détails
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Détails Client */}
            {showDetailsModal && selectedClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Détails du client
                                </h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Informations personnelles */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Informations personnelles</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Nom complet :</span>
                                        <p className="font-medium text-gray-900">{selectedClient.nom_complet}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Email :</span>
                                        <p className="font-medium text-gray-900">{selectedClient.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Téléphone :</span>
                                        <p className="font-medium text-gray-900">{selectedClient.telephone}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ville :</span>
                                        <p className="font-medium text-gray-900">{selectedClient.ville || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Statistiques */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Statistiques</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {selectedClient.nombre_locations || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Locations</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {Math.round((selectedClient.montant_total_depense || 0) / 1000)}k
                                        </p>
                                        <p className="text-sm text-gray-600">FCFA dépensés</p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {selectedClient.note_moyenne || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Note moyenne</p>
                                    </div>
                                </div>
                            </div>

                            {/* Historique récent */}
                            {selectedClient.locations_recentes && selectedClient.locations_recentes.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Locations récentes</h4>
                                    <div className="space-y-2">
                                        {selectedClient.locations_recentes.map((location, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{location.vehicule}</p>
                                                    <p className="text-sm text-gray-600">{formatDate(location.date)}</p>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {location.montant?.toLocaleString('fr-FR')} FCFA
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                            <a
                                href={`mailto:${selectedClient.email}`}
                                className="px-4 py-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition flex items-center space-x-2"
                            >
                                <FiMail className="w-4 h-4" />
                                <span>Envoyer un email</span>
                            </a>
                            <a
                                href={`tel:${selectedClient.telephone}`}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
                            >
                                <FiPhone className="w-4 h-4" />
                                <span>Appeler</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}