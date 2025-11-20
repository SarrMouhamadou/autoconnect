import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import vehiculeService from '../../services/vehiculeService';
import { useConcessionCheck } from '../../hooks/useConcessionCheck';
import NoConcessionAlert from '../../components/concessions/NoConcessionAlert';

function AddVehiculePage() {
  const navigate = useNavigate();
  
  // Vérification concession OBLIGATOIRE
  const { 
    hasValidConcession, 
    concessions, 
    validConcession,
    loading: concessionLoading 
  } = useConcessionCheck();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Informations de base
    marque: '',
    nom_modele: '',
    annee: new Date().getFullYear(),
    immatriculation: '',
    type_vehicule: 'BERLINE',
    couleur: '',
    
    // Caractéristiques techniques
    type_carburant: 'ESSENCE',
    transmission: 'MANUELLE',
    nombre_places: 5,
    nombre_portes: 4,
    climatisation: true,
    kilometrage: 0,
    
    // Disponibilité et prix
    est_disponible_vente: false,
    est_disponible_location: true,
    prix_vente: '',
    prix_location_jour: '',
    caution: '',
    
    // Description
    description: '',
    equipements: [],
    
    // Images
    image_principale: null,
    images_supplementaires: [],
    
    // Concession (automatique)
    concession: null
  });

  const steps = [
    { title: 'Informations', icon: '📋' },
    { title: 'Caractéristiques', icon: '⚙️' },
    { title: 'Disponibilité', icon: '💰' },
    { title: 'Description', icon: '📝' },
    { title: 'Photos', icon: '📸' }
  ];

  // Redirection si pas de concession après chargement
  useEffect(() => {
    if (!concessionLoading && !hasValidConcession) {
      const timer = setTimeout(() => {
        navigate('/my-vehicules');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [concessionLoading, hasValidConcession, navigate]);

  // Pré-remplir la concession
  useEffect(() => {
    if (validConcession) {
      setFormData(prev => ({
        ...prev,
        concession: validConcession.id
      }));
    }
  }, [validConcession]);

  // Si pas de concession, afficher l'alert
  if (concessionLoading || !hasValidConcession) {
    return (
      <DashboardLayout title="Ajouter un véhicule">
        <div className="max-w-5xl mx-auto">
          {concessionLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Vérification des concessions...</p>
            </div>
          ) : (
            <>
              <NoConcessionAlert concessions={concessions} showCreateButton={true} />
              <p className="text-center text-gray-600 mt-4">
                Redirection automatique dans 3 secondes...
              </p>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagePrincipale = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image_principale: file }));
    }
  };

  const handleImagesSupplementaires = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images_supplementaires: [...prev.images_supplementaires, ...files]
    }));
  };

  const removeImageSupplementaire = (index) => {
    setFormData(prev => ({
      ...prev,
      images_supplementaires: prev.images_supplementaires.filter((_, i) => i !== index)
    }));
  };

  const handleEquipementToggle = (equipement) => {
    setFormData(prev => ({
      ...prev,
      equipements: prev.equipements.includes(equipement)
        ? prev.equipements.filter(e => e !== equipement)
        : [...prev.equipements, equipement]
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Informations
        if (!formData.marque || !formData.nom_modele || !formData.immatriculation) {
          setError('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        break;
      case 1: // Caractéristiques
        if (formData.kilometrage < 0) {
          setError('Le kilométrage ne peut pas être négatif');
          return false;
        }
        break;
      case 2: // Disponibilité
        if (!formData.est_disponible_vente && !formData.est_disponible_location) {
          setError('Le véhicule doit être disponible à la vente et/ou à la location');
          return false;
        }
        if (formData.est_disponible_location && !formData.prix_location_jour) {
          setError('Le prix de location est obligatoire');
          return false;
        }
        if (formData.est_disponible_vente && !formData.prix_vente) {
          setError('Le prix de vente est obligatoire');
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

      const formDataToSend = new FormData();

      // Ajouter la concession (automatique)
      formDataToSend.append('concession', validConcession.id);

      // Ajouter les champs texte
      Object.keys(formData).forEach(key => {
        if (key !== 'image_principale' && key !== 'images_supplementaires' && key !== 'equipements' && key !== 'concession') {
          // Convertir virgules en points pour les prix
          if (key === 'prix_location_jour' || key === 'caution' || key === 'prix_vente') {
            const value = formData[key];
            if (value !== '' && value !== null && value !== undefined) {
              formDataToSend.append(key, String(value).replace(',', '.'));
            }
          } else if (typeof formData[key] === 'boolean') {
            formDataToSend.append(key, formData[key]);
          } else if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
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
      formData.images_supplementaires.forEach((image) => {
        formDataToSend.append('images_data', image);
      });

      // Envoyer
      await vehiculeService.createVehicule(formDataToSend);

      // Redirection
      navigate('/my-vehicules', {
        state: { message: 'Véhicule ajouté avec succès !' }
      });

    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout du véhicule');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const equipementsDisponibles = [
    'GPS', 'Bluetooth', 'Caméra de recul', 'Régulateur de vitesse',
    'Sièges chauffants', 'Toit ouvrant', 'Jantes alliage', 'USB',
    'ABS', 'Airbags', 'Alarme', 'Verrouillage centralisé'
  ];

  return (
    <DashboardLayout title="Ajouter un véhicule">
      <div className="max-w-4xl mx-auto">
        {/* Info concession */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-teal-700">
            <strong>🏢 Concession :</strong> {validConcession?.nom}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      index <= currentStep
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs mt-2 text-center font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${
                      index < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* STEP 0: Informations de base */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de base</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marque *
                  </label>
                  <input
                    type="text"
                    name="marque"
                    value={formData.marque}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ex: Toyota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle *
                  </label>
                  <input
                    type="text"
                    name="nom_modele"
                    value={formData.nom_modele}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ex: Corolla"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année *
                  </label>
                  <input
                    type="number"
                    name="annee"
                    value={formData.annee}
                    onChange={handleChange}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Immatriculation *
                  </label>
                  <input
                    type="text"
                    name="immatriculation"
                    value={formData.immatriculation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ex: DK-1234-AB"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de véhicule *
                  </label>
                  <select
                    name="type_vehicule"
                    value={formData.type_vehicule}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="BERLINE">Berline</option>
                    <option value="SUV">SUV</option>
                    <option value="4X4">4x4</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="MINIBUS">Minibus</option>
                    <option value="UTILITAIRE">Utilitaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur *
                  </label>
                  <input
                    type="text"
                    name="couleur"
                    value={formData.couleur}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ex: Blanc"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Caractéristiques */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Caractéristiques techniques</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carburant *
                  </label>
                  <select
                    name="type_carburant"
                    value={formData.type_carburant}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="ESSENCE">Essence</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRIDE">Hybride</option>
                    <option value="ELECTRIQUE">Électrique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transmission *
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="MANUELLE">Manuelle</option>
                    <option value="AUTOMATIQUE">Automatique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de places *
                  </label>
                  <input
                    type="number"
                    name="nombre_places"
                    value={formData.nombre_places}
                    onChange={handleChange}
                    min="2"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de portes *
                  </label>
                  <input
                    type="number"
                    name="nombre_portes"
                    value={formData.nombre_portes}
                    onChange={handleChange}
                    min="2"
                    max="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilométrage (km) *
                  </label>
                  <input
                    type="number"
                    name="kilometrage"
                    value={formData.kilometrage}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="climatisation"
                      checked={formData.climatisation}
                      onChange={handleChange}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Climatisation</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Disponibilité et Prix */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Disponibilité et tarifs</h2>
              
              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="est_disponible_location"
                    checked={formData.est_disponible_location}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Disponible à la location</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <input
                    type="checkbox"
                    name="est_disponible_vente"
                    checked={formData.est_disponible_vente}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Disponible à la vente</span>
                </label>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.est_disponible_location && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix location/jour (FCFA) *
                      </label>
                      <input
                        type="number"
                        name="prix_location_jour"
                        value={formData.prix_location_jour}
                        onChange={handleChange}
                        min="5000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ex: 25000"
                        required={formData.est_disponible_location}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Caution (FCFA)
                      </label>
                      <input
                        type="number"
                        name="caution"
                        value={formData.caution}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Ex: 100000"
                      />
                    </div>
                  </>
                )}

                {formData.est_disponible_vente && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix de vente (FCFA) *
                    </label>
                    <input
                      type="number"
                      name="prix_vente"
                      value={formData.prix_vente}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Ex: 5000000"
                      required={formData.est_disponible_vente}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Description et Équipements */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description et équipements</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Décrivez le véhicule, son état, ses points forts..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipements
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {equipementsDisponibles.map((equipement) => (
                    <label
                      key={equipement}
                      className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={formData.equipements.includes(equipement)}
                        onChange={() => handleEquipementToggle(equipement)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{equipement}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Photos */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos du véhicule</h2>
              
              {/* Image principale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo principale *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagePrincipale}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
                {formData.image_principale && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(formData.image_principale)}
                      alt="Aperçu"
                      className="h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {/* Images supplémentaires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos supplémentaires (max 10)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesSupplementaires}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={formData.images_supplementaires.length >= 10}
                />
                
                {formData.images_supplementaires.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.images_supplementaires.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Aperçu ${index + 1}`}
                          className="h-24 w-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageSupplementaire(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowLeft /> Précédent
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FiCheck /> Enregistrer le véhicule
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                Suivant <FiArrowRight />
              </button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AddVehiculePage;