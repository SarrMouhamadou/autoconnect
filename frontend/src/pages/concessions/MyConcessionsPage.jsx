import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import concessionService from '../../services/concessionService';
import DashboardLayout from '../../components/layout/DashboardLayout';

function MyConcessionsPage() {
  const navigate = useNavigate();
  const [concessions, setConcessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConcessions();
  }, []);

  const loadConcessions = async () => {
    try {
      setLoading(true);
      const data = await concessionService.getMesConcessions();
      setConcessions(data.concessions || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette concession ?')) {
      return;
    }

    try {
      await concessionService.deleteConcession(id);
      loadConcessions();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const getStatutBadge = (statut) => {
    const config = {
      'EN_ATTENTE': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'VALIDE': { color: 'bg-green-100 text-green-800', label: 'Validé' },
      'SUSPENDU': { color: 'bg-orange-100 text-orange-800', label: 'Suspendu' },
      'REJETE': { color: 'bg-red-100 text-red-800', label: 'Rejeté' }
    };
    const { color, label } = config[statut] || config['EN_ATTENTE'];
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLayout title="Ajouter une concession">

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Concessions</h1>
              <p className="text-gray-600 mt-2">Gérez vos parkings automobiles</p>
            </div>
            <button
              onClick={() => navigate('/my-concessions/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <FaPlus /> Ajouter une concession
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : concessions.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FaMapMarkerAlt className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune concession</h3>
              <p className="text-gray-600 mb-6">Commencez par ajouter votre première concession</p>
              <button
                onClick={() => navigate('/my-concessions/add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <FaPlus /> Ajouter une concession
              </button>
            </div>
          ) : (
            /* Liste des concessions */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {concessions.map((concession) => (
                <div key={concession.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Image */}
                  {concession.photo_facade ? (
                    <img
                      src={concession.photo_facade}
                      alt={concession.nom}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-t-lg flex items-center justify-center">
                      <FaMapMarkerAlt className="text-white text-6xl" />
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="p-6">
                    {/* En-tête */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{concession.nom}</h3>
                        <p className="text-gray-600 text-sm">{concession.ville}, {concession.region?.nom}</p>
                      </div>
                      {getStatutBadge(concession.statut)}
                    </div>

                    {/* Infos */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaMapMarkerAlt className="text-blue-600" />
                        {concession.adresse}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaPhone className="text-blue-600" />
                        {concession.telephone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FaEnvelope className="text-blue-600" />
                        {concession.email}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{concession.nombre_vehicules}</div>
                        <div>Véhicules</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{concession.nombre_vues}</div>
                        <div>Vues</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{concession.note_moyenne.toFixed(1)}⭐</div>
                        <div>Note</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/my-concessions/edit/${concession.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(concession.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Message de rejet */}
                    {concession.statut === 'REJETE' && concession.raison_rejet && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Raison du rejet :</strong> {concession.raison_rejet}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}

export default MyConcessionsPage;