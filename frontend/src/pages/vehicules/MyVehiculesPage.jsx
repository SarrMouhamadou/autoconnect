import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import vehiculeService from '../../services/vehiculeService';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFilter } from 'react-icons/fi';
import { useConcessionCheck } from '../../hooks/useConcessionCheck';
import NoConcessionAlert from '../../components/concessions/NoConcessionAlert';


export default function MyVehiculesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
    type_vehicule: '',
  });

  // Charger les véhicules
  useEffect(() => {
    loadVehicules();
  }, [filters]);

  const loadVehicules = async () => {
    try {
      setLoading(true);
      const data = await vehiculeService.getMesVehicules(filters);
      setVehicules(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      await vehiculeService.deleteVehicule(id);
      loadVehicules(); // Recharger la liste
    } catch (err) {
      alert('Erreur lors de la suppression : ' + err.message);
    }
  };

  const {
    hasValidConcession,
    concessions,
    loading: concessionLoading
  } = useConcessionCheck();

  const handleChangeStatut = async (id, nouveauStatut) => {
    try {
      await vehiculeService.changerStatut(id, nouveauStatut);
      loadVehicules();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'DISPONIBLE': 'bg-green-100 text-green-800',
      'LOUE': 'bg-blue-100 text-blue-800',
      'MAINTENANCE': 'bg-orange-100 text-orange-800',
      'INDISPONIBLE': 'bg-gray-100 text-gray-800',
    };
    return badges[statut] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <DashboardLayout title="Mes véhicules">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes véhicules">
      {/* Header avec bouton Ajouter */}

      {!concessionLoading && (
        <NoConcessionAlert concessions={concessions} />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Véhicules</h1>
          <p className="text-gray-600">Gérez votre flotte de véhicules</p>
        </div>

        {/* Bouton désactivé si pas de concession */}
        {hasValidConcession ? (
          <Link
            to="/my-vehicules/add"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <FiPlus /> Ajouter un véhicule
          </Link>
        ) : (
          <button
            disabled
            className="bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-not-allowed opacity-60"
            title="Créez d'abord une concession validée"
          >
            <FiPlus /> Ajouter un véhicule
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par marque, modèle..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Tous les statuts</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="LOUE">Loué</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INDISPONIBLE">Indisponible</option>
          </select>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Liste des véhicules */}
      {vehicules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun véhicule
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par ajouter votre premier véhicule
          </p>
          <Link
            to="/my-vehicules/add"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            <FiPlus className="w-5 h-5" />
            <span>Ajouter un véhicule</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicules.map((vehicule) => (
            <div
              key={vehicule.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {vehicule.image_principale ? (
                  <img
                    src={vehicule.image_principale}
                    alt={vehicule.nom_complet}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">🚗</span>
                  </div>
                )}

                {/* Badge statut */}
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(vehicule.statut)}`}>
                    {vehicule.statut}
                  </span>
                </div>
              </div>

              {/* Infos */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {vehicule.nom_complet}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span>{vehicule.type_vehicule}</span>
                    <span className="font-medium">{vehicule.transmission}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{vehicule.type_carburant}</span>
                    <span>{vehicule.nombre_places} places</span>
                  </div>
                  <div className="space-y-1">
                    {vehicule.est_disponible_location && vehicule.prix_location_jour && (
                      <div className="text-lg font-bold text-blue-600">
                        {parseInt(vehicule.prix_location_jour).toLocaleString('fr-FR')} FCFA/jour
                      </div>
                    )}
                    {vehicule.est_disponible_vente && vehicule.prix_vente && (
                      <div className="text-lg font-bold text-teal-600">
                        {parseInt(vehicule.prix_vente).toLocaleString('fr-FR')} FCFA
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges type d'offre */}
                <div className="flex items-center space-x-2 mt-2">
                  {vehicule.est_disponible_vente && (
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
                      🏷️ Vente
                    </span>
                  )}
                  {vehicule.est_disponible_location && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      📅 Location
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/vehicules/${vehicule.id}`)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    title="Voir"
                  >
                    <FiEye className="w-4 h-4" />
                    <span className="text-sm">Voir</span>
                  </button>

                  <button
                    onClick={() => navigate(`/my-vehicules/edit/${vehicule.id}`)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    title="Modifier"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span className="text-sm">Modifier</span>
                  </button>

                  <button
                    onClick={() => handleDelete(vehicule.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Supprimer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}