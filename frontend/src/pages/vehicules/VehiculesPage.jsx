import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import vehiculeService from '../../services/vehiculeService';
import { FiSearch, FiFilter, FiX, FiMapPin } from 'react-icons/fi';

export default function VehiculesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type_vehicule: searchParams.get('type_vehicule') || '',
    type_carburant: searchParams.get('type_carburant') || '',
    transmission: searchParams.get('transmission') || '',
    prix_min: searchParams.get('prix_min') || '',
    prix_max: searchParams.get('prix_max') || '',
    nombre_places: searchParams.get('nombre_places') || '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  useEffect(() => {
    loadVehicules();
  }, [searchParams]);

  const loadVehicules = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      
      // Construire les paramètres de recherche
      if (filters.search) params.search = filters.search;
      if (filters.type_vehicule) params.type_vehicule = filters.type_vehicule;
      if (filters.type_carburant) params.type_carburant = filters.type_carburant;
      if (filters.transmission) params.transmission = filters.transmission;
      if (filters.prix_min) params.prix_location_jour__gte = filters.prix_min;
      if (filters.prix_max) params.prix_location_jour__lte = filters.prix_max;
      if (filters.nombre_places) params.nombre_places = filters.nombre_places;

      const data = await vehiculeService.getAllVehicules(params);

      if (data.results) {
        setVehicules(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      } else {
        setVehicules(data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Mettre à jour l'URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type_vehicule: '',
      type_carburant: '',
      transmission: '',
      prix_min: '',
      prix_max: '',
      nombre_places: '',
    });
    setSearchParams({});
  };

  const hasActiveFilters = Object.values(filters).some(val => val);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-teal-600">
              AutoConnect
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-teal-600 hover:text-teal-700"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">
            Trouvez votre véhicule idéal
          </h1>
          <p className="text-teal-100 mb-6">
            {pagination.count} véhicule{pagination.count > 1 ? 's' : ''} disponible{pagination.count > 1 ? 's' : ''} à la location
          </p>

          {/* Barre de recherche principale */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par marque, modèle..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-4 bg-white text-teal-600 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <FiFilter className="w-5 h-5" />
              <span>Filtres</span>
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-1 bg-teal-600 text-white text-xs rounded-full">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Filtres avancés
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <FiX className="w-4 h-4" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type de véhicule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de véhicule
                </label>
                <select
                  value={filters.type_vehicule}
                  onChange={(e) => handleFilterChange('type_vehicule', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Tous</option>
                  <option value="BERLINE">Berline</option>
                  <option value="SUV">SUV</option>
                  <option value="4X4">4x4</option>
                  <option value="CITADINE">Citadine</option>
                  <option value="BREAK">Break</option>
                  <option value="COUPE">Coupé</option>
                  <option value="MONOSPACE">Monospace</option>
                  <option value="UTILITAIRE">Utilitaire</option>
                  <option value="PICK_UP">Pick-up</option>
                  <option value="SPORTIVE">Sportive</option>
                </select>
              </div>

              {/* Carburant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carburant
                </label>
                <select
                  value={filters.type_carburant}
                  onChange={(e) => handleFilterChange('type_carburant', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Tous</option>
                  <option value="ESSENCE">Essence</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRIDE">Hybride</option>
                  <option value="ELECTRIQUE">Électrique</option>
                  <option value="GAZ">Gaz</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission
                </label>
                <select
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Tous</option>
                  <option value="MANUELLE">Manuelle</option>
                  <option value="AUTOMATIQUE">Automatique</option>
                  <option value="SEMI_AUTO">Semi-automatique</option>
                </select>
              </div>

              {/* Nombre de places */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de places
                </label>
                <select
                  value={filters.nombre_places}
                  onChange={(e) => handleFilterChange('nombre_places', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Tous</option>
                  <option value="2">2 places</option>
                  <option value="4">4 places</option>
                  <option value="5">5 places</option>
                  <option value="7">7 places</option>
                  <option value="9">9+ places</option>
                </select>
              </div>

              {/* Prix min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix min (FCFA)
                </label>
                <input
                  type="number"
                  value={filters.prix_min}
                  onChange={(e) => handleFilterChange('prix_min', e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Prix max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix max (FCFA)
                </label>
                <input
                  type="number"
                  value={filters.prix_max}
                  onChange={(e) => handleFilterChange('prix_max', e.target.value)}
                  placeholder="Ex: 100000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des véhicules */}
        {!loading && vehicules.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun véhicule trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {!loading && vehicules.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicules.map((vehicule) => (
              <Link
                key={vehicule.id}
                to={`/vehicules/${vehicule.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {vehicule.image_principale ? (
                    <img
                      src={vehicule.image_principale}
                      alt={vehicule.nom_complet}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-6xl">🚗</span>
                    </div>
                  )}

                  {/* Badge disponible */}
                  <div className="absolute top-2 right-2">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Disponible
                    </span>
                  </div>
                </div>

                {/* Infos */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition">
                    {vehicule.nom_complet}
                  </h3>

                  {/* Caractéristiques */}
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <span>🚙</span>
                      <span>{vehicule.type_vehicule}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>⚙️</span>
                      <span>{vehicule.transmission}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>⛽</span>
                      <span>{vehicule.type_carburant}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>{vehicule.nombre_places} places</span>
                    </div>
                  </div>

                  {/* Concessionnaire */}
                  {vehicule.concessionnaire_nom && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                      <FiMapPin className="w-4 h-4" />
                      <span>{vehicule.concessionnaire_nom}</span>
                    </div>
                  )}

                  {/* Prix */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <div className="text-2xl font-bold text-teal-600">
                        {parseInt(vehicule.prix_location_jour).toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-xs text-gray-500">par jour</div>
                    </div>

                    {/* Note */}
                    {vehicule.nombre_avis > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium">
                          {parseFloat(vehicule.note_moyenne).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({vehicule.nombre_avis})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}