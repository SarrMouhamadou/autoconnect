import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import vehiculeService from '../../services/vehiculeService';
import { 
  FiArrowLeft, FiMapPin, FiCheck, FiCalendar, 
  FiUser, FiPhone, FiMail, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

export default function VehiculeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicule, setVehicule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Galerie d'images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    loadVehicule();
  }, [id]);

  const loadVehicule = async () => {
    try {
      setLoading(true);
      const data = await vehiculeService.getVehicule(id);
      setVehicule(data);

      // Construire la galerie d'images
      const images = [data.image_principale];
      if (data.images && data.images.length > 0) {
        images.push(...data.images.map(img => img.image));
      }
      setAllImages(images);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !vehicule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Véhicule introuvable'}</p>
          <Link to="/vehicules" className="text-teal-600 hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-teal-600">
              AutoConnect
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-teal-600 hover:text-teal-700"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-teal-600 hover:text-teal-700"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/vehicules" className="hover:text-teal-600">
            Catalogue
          </Link>
          <span>/</span>
          <span className="text-gray-900">{vehicule.nom_complet}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Images et infos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie d'images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {allImages.length > 0 ? (
                <div className="relative">
                  <img
                    src={allImages[currentImageIndex]}
                    alt={vehicule.nom_complet}
                    className="w-full h-96 object-cover"
                  />

                  {/* Boutons navigation */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"
                      >
                        <FiChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white shadow-lg"
                      >
                        <FiChevronRight className="w-6 h-6" />
                      </button>

                      {/* Indicateurs */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex
                                ? 'bg-white'
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-8xl">🚗</span>
                </div>
              )}

              {/* Miniatures */}
              {allImages.length > 1 && (
                <div className="flex space-x-2 p-4 overflow-x-auto">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 ${
                        index === currentImageIndex
                          ? 'ring-2 ring-teal-600'
                          : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {vehicule.description || 'Aucune description disponible.'}
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Caractéristiques
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚙</span>
                  <div>
                    <div className="text-sm text-gray-600">Type</div>
                    <div className="font-medium">{vehicule.type_vehicule}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <div className="text-sm text-gray-600">Transmission</div>
                    <div className="font-medium">{vehicule.transmission}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⛽</span>
                  <div>
                    <div className="text-sm text-gray-600">Carburant</div>
                    <div className="font-medium">{vehicule.type_carburant}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="text-sm text-gray-600">Places</div>
                    <div className="font-medium">{vehicule.nombre_places} places</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚪</span>
                  <div>
                    <div className="text-sm text-gray-600">Portes</div>
                    <div className="font-medium">{vehicule.nombre_portes} portes</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🌡️</span>
                  <div>
                    <div className="text-sm text-gray-600">Climatisation</div>
                    <div className="font-medium">
                      {vehicule.climatisation ? 'Oui' : 'Non'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📏</span>
                  <div>
                    <div className="text-sm text-gray-600">Kilométrage</div>
                    <div className="font-medium">
                      {parseInt(vehicule.kilometrage).toLocaleString('fr-FR')} km
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <div className="text-sm text-gray-600">Couleur</div>
                    <div className="font-medium">{vehicule.couleur}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Équipements */}
            {vehicule.equipements && vehicule.equipements.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Équipements
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {vehicule.equipements.map((equipement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FiCheck className="text-teal-600 flex-shrink-0" />
                      <span className="text-gray-700">{equipement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-3xl font-bold text-teal-600 mb-1">
                  {parseInt(vehicule.prix_jour).toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-sm text-gray-600">par jour</div>
              </div>

              {/* Caution */}
              {vehicule.caution > 0 && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Caution</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {parseInt(vehicule.caution).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              )}

              {/* Statut */}
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Disponible
                </span>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3 mb-6">
                {user ? (
                  <>
                    <button className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
                      Réserver maintenant
                    </button>
                    <button className="w-full px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-medium">
                      Demander un devis
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-center"
                  >
                    Se connecter pour réserver
                  </Link>
                )}
              </div>

              {/* Infos concessionnaire */}
              {vehicule.concessionnaire && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Concessionnaire
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <FiUser className="w-4 h-4" />
                      <span>{vehicule.concessionnaire.nom_entreprise}</span>
                    </div>
                    {vehicule.concessionnaire.telephone && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <FiPhone className="w-4 h-4" />
                        <span>{vehicule.concessionnaire.telephone}</span>
                      </div>
                    )}
                    {vehicule.concessionnaire.adresse && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <FiMapPin className="w-4 h-4" />
                        <span>{vehicule.concessionnaire.adresse}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}