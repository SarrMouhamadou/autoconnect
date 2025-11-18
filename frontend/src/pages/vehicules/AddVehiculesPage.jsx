import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import vehiculeService from '../../services/vehiculeService';
import { FiCheck, FiX, FiUpload } from 'react-icons/fi';

export default function AddVehiculesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Données du formulaire
  const [formData, setFormData] = useState({
    // Étape 1 : Informations de base
    marque: '',
    modele: '',
    annee: new Date().getFullYear(),
    type_vehicule: 'BERLINE',
    couleur: '',
    immatriculation: '',

    // Étape 2 : Caractéristiques
    type_carburant: 'ESSENCE',
    transmission: 'MANUELLE',
    nombre_places: 5,
    nombre_portes: 4,
    climatisation: true,
    kilometrage: 0,

    // Étape 3 : Tarification
    prix_jour: '',
    caution: '',

    // Étape 4 : Description
    description: '',
    equipements: [],

    // Étape 5 : Images
    image_principale: null,
    images_supplementaires: [],
  });

  // Preview des images
  const [imagePreviews, setImagePreviews] = useState({
    principale: null,
    supplementaires: [],
  });

  const steps = [
    { title: 'Informations de base', icon: '📋' },
    { title: 'Caractéristiques', icon: '⚙️' },
    { title: 'Tarification', icon: '💰' },
    { title: 'Description', icon: '📝' },
    { title: 'Photos', icon: '📷' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleImageChange = (e, type) => {
    const files = Array.from(e.target.files);

    if (type === 'principale') {
      const file = files[0];
      setFormData(prev => ({ ...prev, image_principale: file }));

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, principale: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        images_supplementaires: [...prev.images_supplementaires, ...files]
      }));

      // Previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => ({
            ...prev,
            supplementaires: [...prev.supplementaires, reader.result]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeSupplementaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images_supplementaires: prev.images_supplementaires.filter((_, i) => i !== index),
    }));
    setImagePreviews(prev => ({
      ...prev,
      supplementaires: prev.supplementaires.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Infos de base
        if (!formData.marque || !formData.modele || !formData.immatriculation) {
          setError('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        break;
      case 1: // Caractéristiques
        if (formData.kilometrage < 0) {
          setError('Le kilométrage doit être positif');
          return false;
        }
        break;
      case 2: // Tarification
        if (!formData.prix_jour || formData.prix_jour < 5000) {
          setError('Le prix doit être d\'au moins 5000 FCFA');
          return false;
        }
        break;
      case 4: // Photos
        if (!formData.image_principale) {
          setError('Veuillez ajouter au moins une photo principale');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      setError(null);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    try {
      setLoading(true);
      setError(null);

      // Créer FormData
      const formDataToSend = new FormData();

      // Ajouter les champs texte
      Object.keys(formData).forEach(key => {
        if (key !== 'image_principale' && key !== 'images_supplementaires' && key !== 'equipements') {
          // ✅ AJOUTER : Convertir virgules en points pour prix_jour et caution
          if (key === 'prix_jour' || key === 'caution') {
            formDataToSend.append(key, String(formData[key]).replace(',', '.'));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Ajouter équipements (JSON)
      formDataToSend.append('equipements', JSON.stringify(formData.equipements));

      // Ajouter image principale
      if (formData.image_principale) {
        formDataToSend.append('image_principale', formData.image_principale);
      }

      // Ajouter images supplémentaires
      formData.images_supplementaires.forEach((image, index) => {
        formDataToSend.append('images_data', image);
      });

      // Envoyer
      await vehiculeService.createVehicule(formDataToSend);

      // Redirection
      navigate('/my-vehiceles', {
        state: { message: 'Véhicule ajouté avec succès !' }
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Ajouter un véhicule">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${index <= currentStep
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {index < currentStep ? <FiCheck /> : step.icon}
                  </div>
                  <span className={`text-xs mt-2 text-center ${index <= currentStep ? 'text-teal-600 font-medium' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Étape 0 : Informations de base */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Informations de base
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marque <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="marque"
                      value={formData.marque}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: Toyota"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modèle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="modele"
                      value={formData.modele}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: Corolla"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Année <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="annee"
                      value={formData.annee}
                      onChange={handleChange}
                      required
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de véhicule <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type_vehicule"
                      value={formData.type_vehicule}
                      onChange={handleChange}
                      required
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
                      Couleur <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="couleur"
                      value={formData.couleur}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: Blanc"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Immatriculation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="immatriculation"
                      value={formData.immatriculation}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: DK-1234-AA"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 1 : Caractéristiques */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Caractéristiques techniques
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Nombre de places
                    </label>
                    <input
                      type="number"
                      name="nombre_places"
                      value={formData.nombre_places}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de portes
                    </label>
                    <input
                      type="number"
                      name="nombre_portes"
                      value={formData.nombre_portes}
                      onChange={handleChange}
                      min="2"
                      max="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
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
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="climatisation"
                      checked={formData.climatisation}
                      onChange={handleChange}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Climatisation
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Tarification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Tarification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix par jour (FCFA) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="prix_jour"
                      value={formData.prix_jour}
                      onChange={handleChange}
                      required
                      min="5000"
                      step="1000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: 25000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 5 000 FCFA</p>
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
                      placeholder="Ex: 100000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optionnel</p>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 : Description */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Description et équipements
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du véhicule
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Décrivez votre véhicule..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Équipements (un par ligne)
                  </label>
                  <textarea
                    value={formData.equipements.join('\n')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      equipements: e.target.value.split('\n').filter(eq => eq.trim())
                    }))}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="GPS&#10;Bluetooth&#10;Caméra de recul&#10;Régulateur de vitesse"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ajoutez chaque équipement sur une nouvelle ligne
                  </p>
                </div>
              </div>
            )}

            {/* Étape 4 : Photos */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Photos du véhicule
                </h3>

                {/* Image principale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo principale <span className="text-red-500">*</span>
                  </label>

                  {imagePreviews.principale ? (
                    <div className="relative">
                      <img
                        src={imagePreviews.principale}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image_principale: null }));
                          setImagePreviews(prev => ({ ...prev, principale: null }));
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Cliquez pour ajouter une photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'principale')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Images supplémentaires */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos supplémentaires (optionnel)
                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.supplementaires.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeSupplementaryImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Bouton ajouter */}
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <FiUpload className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Ajouter</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageChange(e, 'supplementaires')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Créer le véhicule'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}