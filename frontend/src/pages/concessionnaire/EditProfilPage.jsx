import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProfileProgressBar from '../../components/profile/ProfileProgressBar';
import authService from '../../services/authService';
import { getMediaUrl } from '../../utils/helpers';
import { FiArrowLeft } from 'react-icons/fi';

export default function EditProfilPage() {
  const { user, updateProfile, isConcessionnaire } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    // Champs concessionnaire
    nom_entreprise: '',
    site_web: '',
    description_entreprise: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [profileProgress, setProfileProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        ville: user.ville || '',
        code_postal: user.code_postal || '',
        nom_entreprise: user.nom_entreprise || '',
        site_web: user.site_web || '',
        description_entreprise: user.description_entreprise || '',
      });
      setPhotoPreview(user.photo_profil);
    }
  }, [user]);

  // Charger la progression
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoadingProgress(true);
        const progress = await authService.getProfileProgress();
        setProfileProgress(progress);
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 5 MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image');
        return;
      }

      setPhotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);

      let dataToSend;

      if (photoFile) {
        const formDataToSend = new FormData();

        Object.keys(formData).forEach(key => {
          const value = formData[key];
          const forbiddenFields = ['nom_entreprise', 'siret'];
          if (forbiddenFields.includes(key)) return;

          if (value !== '' && value !== null && value !== undefined) {
            if (typeof value === 'boolean') {
              formDataToSend.append(key, value);
            } else if (typeof value === 'object' && !Array.isArray(value)) {
              formDataToSend.append(key, JSON.stringify(value));
            } else {
              formDataToSend.append(key, value);
            }
          }
        });

        formDataToSend.append('photo_profil', photoFile);
        dataToSend = formDataToSend;
      } else {
        const cleanData = {};

        Object.keys(formData).forEach(key => {
          const value = formData[key];
          const forbiddenFields = ['nom_entreprise', 'siret'];
          if (forbiddenFields.includes(key)) return;

          if (value !== '' && value !== null && value !== undefined) {
            cleanData[key] = value;
          }
        });

        dataToSend = cleanData;
      }

      await updateProfile(dataToSend);

      setSuccess(true);

      setTimeout(() => {
        navigate('/concessionnaire/profil');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Modifier mon profil">
      <div className="mb-6">
        <Link
          to="/concessionnaire/profil"
          className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center mb-4"
        >
          <FiArrowLeft className="w-4 h-4 mr-1" />
          Retour au profil
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier mon profil</h1>
        <p className="text-gray-600 mt-1">
          Mettez à jour vos informations personnelles
        </p>
      </div>

      {/* Barre de progression */}
      {!loadingProgress && profileProgress && user?.pourcentage_completion < 100 && (
        <div className="mb-6">
          <ProfileProgressBar
            pourcentage={profileProgress.pourcentage_completion}
            etapesManquantes={profileProgress.etapes_manquantes}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Profil mis à jour avec succès ! Redirection...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Photo de profil */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Photo de profil
          </h3>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img
                  src={photoPreview.startsWith('blob:') ? photoPreview : getMediaUrl(photoPreview)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-teal-600 font-bold">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </span>
              )}
            </div>
            <div>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label
                htmlFor="photo"
                className="cursor-pointer px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition inline-block"
              >
                Choisir une photo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG ou GIF. Max 5 MB.
              </p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                required
                value={formData.prenom}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                value={formData.nom}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="+221 77 123 45 67"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Adresse
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                Rue
              </label>
              <input
                id="adresse"
                name="adresse"
                type="text"
                value={formData.adresse}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                id="ville"
                name="ville"
                type="text"
                value={formData.ville}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="code_postal" className="block text-sm font-medium text-gray-700 mb-2">
                Code postal
              </label>
              <input
                id="code_postal"
                name="code_postal"
                type="text"
                value={formData.code_postal}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Informations entreprise */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informations entreprise
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="nom_entreprise" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise
              </label>
              <input
                id="nom_entreprise"
                name="nom_entreprise"
                type="text"
                value={formData.nom_entreprise}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Contactez l'administrateur pour modifier le nom de l'entreprise
              </p>
            </div>

            <div>
              <label htmlFor="site_web" className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <input
                id="site_web"
                name="site_web"
                type="url"
                value={formData.site_web}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <label htmlFor="description_entreprise" className="block text-sm font-medium text-gray-700 mb-2">
                Description de l'entreprise
              </label>
              <textarea
                id="description_entreprise"
                name="description_entreprise"
                rows={4}
                value={formData.description_entreprise}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Décrivez votre entreprise..."
              />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            to="/concessionnaire/profil"
            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}