import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';
import axios from 'axios';

export default function VehicleSelector({ selectedVehicles, onAdd, maxVehicles = 4 }) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Rechercher des véhicules
    useEffect(() => {
        const searchVehicles = async () => {
            if (search.length < 2) {
                setResults([]);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get('/api/vehicules/', {
                    params: {
                        search,
                        page_size: 10,
                    },
                });

                // Filtrer les véhicules déjà sélectionnés
                const selectedIds = selectedVehicles.map(v => v.id);
                const filteredResults = (response.data.results || []).filter(
                    v => !selectedIds.includes(v.id)
                );

                setResults(filteredResults);
            } catch (err) {
                console.error('Erreur lors de la recherche:', err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchVehicles, 300);
        return () => clearTimeout(debounce);
    }, [search, selectedVehicles]);

    // Ajouter un véhicule
    const handleAdd = (vehicule) => {
        if (selectedVehicles.length >= maxVehicles) {
            alert(`Vous ne pouvez comparer que ${maxVehicles} véhicules maximum.`);
            return;
        }

        onAdd(vehicule);
        setSearch('');
        setResults([]);
        setShowResults(false);
    };

    const canAddMore = selectedVehicles.length < maxVehicles;

    return (
        <div className="relative">
            {/* Barre de recherche */}
            <div className={`relative ${!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400 text-xl" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder={
                        canAddMore
                            ? 'Rechercher un véhicule à ajouter...'
                            : `Maximum ${maxVehicles} véhicules atteint`
                    }
                    disabled={!canAddMore}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                />

                {/* Badge compteur */}
                <div className="absolute inset-y-0 right-4 flex items-center">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-semibold rounded-full">
                        {selectedVehicles.length}/{maxVehicles}
                    </span>
                </div>
            </div>

            {/* Résultats de recherche */}
            {showResults && search.length >= 2 && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                            <p className="text-gray-600 mt-2">Recherche en cours...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((vehicule) => (
                                <button
                                    key={vehicule.id}
                                    onClick={() => handleAdd(vehicule)}
                                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center space-x-4 group"
                                >
                                    {/* Image */}
                                    <div className="flex-shrink-0 w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                        <img
                                            src={vehicule.photos?.[0]?.image || 'https://via.placeholder.com/80x64'}
                                            alt={vehicule.nom_complet}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        />
                                    </div>

                                    {/* Infos */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">
                                            {vehicule.nom_complet}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {vehicule.categorie?.nom} • {vehicule.annee}
                                        </p>
                                    </div>

                                    {/* Prix */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className="font-bold text-teal-600">
                                            {new Intl.NumberFormat('fr-FR', {
                                                style: 'currency',
                                                currency: 'XOF',
                                                minimumFractionDigits: 0,
                                            }).format(
                                                vehicule.type_offre === 'LOCATION'
                                                    ? vehicule.prix_location_jour
                                                    : vehicule.prix_vente
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {vehicule.type_offre === 'LOCATION' ? '/jour' : ''}
                                        </p>
                                    </div>

                                    {/* Icône ajout */}
                                    <FiPlus className="text-teal-600 text-xl group-hover:scale-125 transition-transform" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            Aucun véhicule trouvé pour "{search}"
                        </div>
                    )}
                </div>
            )}

            {/* Overlay pour fermer les résultats */}
            {showResults && search.length >= 2 && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowResults(false)}
                />
            )}
        </div>
    );
}