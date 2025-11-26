import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import vehiculeService from '../../services/vehiculeService';
import {
  FiArrowLeft, FiMapPin, FiCheck, FiCalendar,
  FiUser, FiPhone, FiMail, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import VehiculeLocationMap from '../../components/vehicules/VehiculeLocationMap';

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
                  Tableau de bord
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

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft />
          <span>Retour</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Détails véhicule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie d'images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {allImages.length > 0 ? (
                <div className="relative">
                  {/* Image principale */}
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
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                      >
                        <FiChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                      >
                        <FiChevronRight className="w-6 h-6" />
                      </button>

                      {/* Indicateurs */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                                ? 'bg-white w-8'
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
                      className={`flex-shrink-0 ${index === currentImageIndex
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

            {/* Titre et prix */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vehicule.nom_complet}
                  </h1>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FiMapPin className="w-4 h-4" />
                    <span>
                      {vehicule.concession?.ville || 'Non spécifié'},{' '}
                      {vehicule.concession?.region || 'Sénégal'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {vehicule.disponible_location && (
                    <div className="text-3xl font-bold text-teal-600 mb-1">
                      {vehicule.prix_location_jour?.toLocaleString()} FCFA
                      <span className="text-lg font-normal text-gray-600">
                        /jour
                      </span>
                    </div>
                  )}
                  {vehicule.disponible_vente && (
                    <div className="text-2xl font-bold text-gray-900">
                      {vehicule.prix_vente?.toLocaleString()} FCFA
                    </div>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {vehicule.disponible_location && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
                    Location
                  </span>
                )}
                {vehicule.disponible_vente && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Vente
                  </span>
                )}
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${vehicule.statut === 'DISPONIBLE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}
                >
                  {vehicule.statut}
                </span>
              </div>
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
                    <div className="font-medium">
                      {vehicule.nombre_places} places
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚪</span>
                  <div>
                    <div className="text-sm text-gray-600">Portes</div>
                    <div className="font-medium">
                      {vehicule.nombre_portes} portes
                    </div>
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

                {vehicule.kilometrage && (
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📏</span>
                    <div>
                      <div className="text-sm text-gray-600">Kilométrage</div>
                      <div className="font-medium">
                        {vehicule.kilometrage.toLocaleString()} km
                      </div>
                    </div>
                  </div>
                )}

                {vehicule.annee_fabrication && (
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <div className="text-sm text-gray-600">Année</div>
                      <div className="font-medium">
                        {vehicule.annee_fabrication}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Équipements */}
            {vehicule.equipements && vehicule.equipements.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Équipements
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicule.equipements.map((equipement, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-gray-700"
                    >
                      <FiCheck className="w-5 h-5 text-teal-600" />
                      <span>{equipement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Carte de localisation */}
            {vehicule.concession && (
              <VehiculeLocationMap concession={vehicule.concession} />
            )}
          </div>

          {/* Colonne droite - Réservation/Contact */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Réserver ce véhicule
              </h3>

              {vehicule.disponible_location && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Prix par jour
                  </div>
                  <div className="text-2xl font-bold text-teal-600">
                    {vehicule.prix_location_jour?.toLocaleString()} FCFA
                  </div>
                </div>
              )}

              {vehicule.disponible_vente && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Prix de vente</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {vehicule.prix_vente?.toLocaleString()} FCFA
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {user ? (
                  <>
                    {vehicule.disponible_location && (
                      <Link
                        to={`/vehicules/${vehicule.id}/reserver`}
                        className="block w-full bg-teal-600 hover:bg-teal-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                      >
                        Réserver maintenant
                      </Link>
                    )}
                    <Link
                      to={`/vehicules/${vehicule.id}/demande`}
                      className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-center py-3 rounded-lg font-medium transition-colors"
                    >
                      Demander un devis
                    </Link>
                  </>
                ) : (
                  <Link
                    to={`/login?redirect=/vehicules/${vehicule.id}`}
                    className="block w-full bg-teal-600 hover:bg-teal-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                  >
                    Se connecter pour{' '}
                    {vehicule.disponible_location ? 'réserver' : 'acheter'}
                  </Link>
                )}
              </div>

              {/* Infos concessionnaire */}
              {vehicule.concessionnaire && (
                <div className="pt-6 border-t mt-6">
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
                    {vehicule.concessionnaire.email && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <FiMail className="w-4 h-4" />
                        <span>{vehicule.concessionnaire.email}</span>
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