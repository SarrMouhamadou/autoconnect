import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import vehiculeService from '../../services/vehiculeService';
import { FiSave, FiX, FiUpload, FiTrash2 } from 'react-icons/fi';

export default function EditVehiculesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicule, setVehicule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    type_vehicule: '',
    couleur: '',
    type_carburant: '',
    transmission: '',
    nombre_places: 5,
    nombre_portes: 4,
    climatisation: true,
    kilometrage: 0,
    est_disponible_vente: false,
    est_disponible_location: false,
    prix_vente: '',
    prix_location_jour: '',
    caution: '',
    description: '',
    equipements: [],
    statut: 'DISPONIBLE',
  });

  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadVehicule();
  }, [id]);

  const loadVehicule = async () => {
    try {
      setLoading(true);
      const data = await vehiculeService.getVehicule(id);
      setVehicule(data);

      // Remplir le formulaire
      setFormData({
        type_vehicule: data.type_vehicule || '',
        couleur: data.couleur || '',
        type_carburant: data.type_carburant || '',
        transmission: data.transmission || '',
        nombre_places: data.nombre_places || 5,
        nombre_portes: data.nombre_portes || 4,
        climatisation: data.climatisation !== undefined ? data.climatisation : true,
        kilometrage: data.kilometrage || 0,
        est_disponible_vente: data.est_disponible_vente || false,
        est_disponible_location: data.est_disponible_location || false,
        prix_vente: data.prix_vente || '',
        prix_location_jour: data.prix_location_jour || '',
        caution: data.caution || '',
        description: data.description || '',
        equipements: data.equipements || [],
        statut: data.statut || 'DISPONIBLE',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);

    // Previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Supprimer cette image ?')) return;

    try {
      await vehiculeService.supprimerImage(id, imageId);
      loadVehicule(); // Recharger
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const dataToSend = {
        ...formData,
        prix_location_jour: formData.prix_location_jour ? String(formData.prix_location_jour).replace(',', '.') : null,
        prix_vente: formData.prix_vente ? String(formData.prix_vente).replace(',', '.') : null,
        caution: formData.caution ? String(formData.caution).replace(',', '.') : null,
      };

      // Mise à jour des données
      await vehiculeService.updateVehicule(id, formData);

      // Ajouter nouvelles images si nécessaire
      if (newImages.length > 0) {
        await vehiculeService.ajouterImages(id, newImages);
      }

      navigate('/my-vehicules', {
        state: { message: 'Véhicule mis à jour avec succès !' }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Modifier le véhicule">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vehicule) {
    return (
      <DashboardLayout title="Véhicule introuvable">
        <div className="text-center py-12">
          <p className="text-gray-600">Véhicule introuvable</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Modifier ${vehicule.nom_complet}`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations non modifiables */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Informations du véhicule
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Marque/Modèle:</span>
                  <p className="font-medium">{vehicule.nom_complet}</p>
                </div>
                <div>
                  <span className="text-gray-600">Immatriculation:</span>
                  <p className="font-medium">{vehicule.immatriculation}</p>
                </div>
              </div>
            </div>

            {/* Caractéristiques modifiables */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Caractéristiques
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de véhicule
                  </label>
                  <select
                    name="type_vehicule"
                    value={formData.type_vehicule}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <input
                    type="text"
                    name="couleur"
                    value={formData.couleur}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de carburant
                  </label>
                  <select
                    name="type_carburant"
                    value={formData.type_carburant}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ESSENCE">Essence</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRIDE">Hybride</option>
                    <option value="ELECTRIQUE">Électrique</option>
                    <option value="GAZ">Gaz (GPL/GNV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="MANUELLE">Manuelle</option>
                    <option value="AUTOMATIQUE">Automatique</option>
                    <option value="SEMI_AUTO">Semi-automatique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilométrage (km)
                  </label>
                  <input
                    type="number"
                    name="kilometrage"
                    value={formData.kilometrage}
                    onChange={handleChange}
                    min={vehicule.kilometrage}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ancien: {vehicule.kilometrage} km
                  </p>
                </div>
              </div>
            </div>

            {/* Tarification */}
            {/* Tarification */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Type d'offre et tarification
              </h3>

              {/* Type d'offre */}
              <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg mb-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.est_disponible_vente}
                      onChange={(e) => setFormData({
                        ...formData,
                        est_disponible_vente: e.target.checked
                      })}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🏷️ Disponible à la vente
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.est_disponible_location}
                      onChange={(e) => setFormData({
                        ...formData,
                        est_disponible_location: e.target.checked
                      })}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      📅 Disponible à la location
                    </span>
                  </label>
                </div>
              </div>

              {/* Prix de vente */}
              {formData.est_disponible_vente && (
                <div className="mb-4 p-4 bg-white border-2 border-teal-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">💰 Prix de vente</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix de vente (FCFA)
                    </label>
                    <input
                      type="number"
                      name="prix_vente"
                      value={formData.prix_vente}
                      onChange={handleChange}
                      min="100000"
                      step="100000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}

              {/* Prix de location */}
              {formData.est_disponible_location && (
                <div className="p-4 bg-white border-2 border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">📅 Tarifs de location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix par jour (FCFA)
                      </label>
                      <input
                        type="number"
                        name="prix_location_jour"
                        value={formData.prix_location_jour}
                        onChange={handleChange}
                        min="5000"
                        step="1000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caution (FCFA)
                      </label>
                      <input
                        type="number"
                        name="caution"
                        value={formData.caution}
                        onChange={handleChange}
                        min="0"
                        step="10000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Statut */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statut du véhicule
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="LOUE">Loué</option>
                  <option value="MAINTENANCE">En maintenance</option>
                  <option value="INDISPONIBLE">Indisponible</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Le statut "Loué" sera géré automatiquement lors d'une location
                </p>
              </div>
            </div>

            {/* Images existantes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Images actuelles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Image principale */}
                {vehicule.image_principale && (
                  <div className="relative">
                    <img
                      src={vehicule.image_principale}
                      alt="Principale"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <span className="absolute top-1 left-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      Principale
                    </span>
                  </div>
                )}

                {/* Images supplémentaires */}
                {vehicule.images?.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.image}
                      alt="Supplementaire"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nouvelles images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ajouter des images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`New ${index}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <FiUpload className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/my-vehicules')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                <FiSave />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}