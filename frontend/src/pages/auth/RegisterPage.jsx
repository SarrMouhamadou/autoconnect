import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();

  const [userType, setUserType] = useState('CLIENT'); // CLIENT ou CONCESSIONNAIRE
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    // Champs concessionnaire
    nom_entreprise: '',
    siret: '',
    site_web: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Gérer les changements dans les inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  // Gérer le changement de type d'utilisateur
  const handleUserTypeChange = (type) => {
    setUserType(type);
    if (error) setError(null);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation basique
    if (!formData.email || !formData.password || !formData.nom || !formData.prenom) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.password2) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // Validation spécifique concessionnaire
    if (userType === 'CONCESSIONNAIRE') {
      if (!formData.nom_entreprise || !formData.siret) {
        setError('Le nom d\'entreprise et le SIRET sont obligatoires pour un concessionnaire');
        return;
      }
      if (formData.siret.length !== 14) {
        setError('Le SIRET doit contenir exactement 14 chiffres');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Préparer les données
      const userData = {
        ...formData,
        type_utilisateur: userType
      };

      await register(userData);
      
      // Redirection après inscription réussie
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚗 AutoConnect
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez-nous dès aujourd'hui
          </p>
        </div>

        {/* Sélection du type d'utilisateur */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Je suis un(e) :
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleUserTypeChange('CLIENT')}
              className={`p-4 rounded-lg border-2 transition ${
                userType === 'CLIENT'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">👤</div>
                <div className="font-medium text-gray-900">Client</div>
                <div className="text-sm text-gray-500 mt-1">
                  Je cherche à louer un véhicule
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleUserTypeChange('CONCESSIONNAIRE')}
              className={`p-4 rounded-lg border-2 transition ${
                userType === 'CONCESSIONNAIRE'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🏢</div>
                <div className="font-medium text-gray-900">Concessionnaire</div>
                <div className="text-sm text-gray-500 mt-1">
                  Je propose des véhicules à louer
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Affichage des erreurs */}
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

            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Diop"
                  />
                </div>

                {/* Prénom */}
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Aminata"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="exemple@email.com"
                  />
                </div>

                {/* Téléphone */}
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+221 77 123 45 67"
                  />
                </div>
              </div>
            </div>

            {/* Champs spécifiques concessionnaire */}
            {userType === 'CONCESSIONNAIRE' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informations entreprise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom entreprise */}
                  <div className="md:col-span-2">
                    <label htmlFor="nom_entreprise" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nom_entreprise"
                      name="nom_entreprise"
                      type="text"
                      required={userType === 'CONCESSIONNAIRE'}
                      value={formData.nom_entreprise}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Auto Dakar"
                    />
                  </div>

                  {/* SIRET */}
                  <div>
                    <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-2">
                      SIRET <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="siret"
                      name="siret"
                      type="text"
                      required={userType === 'CONCESSIONNAIRE'}
                      value={formData.siret}
                      onChange={handleChange}
                      maxLength={14}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="12345678901234"
                    />
                    <p className="mt-1 text-xs text-gray-500">14 chiffres</p>
                  </div>

                  {/* Site web */}
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Adresse */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="123 Avenue Léopold Sédar Senghor"
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Dakar"
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
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Sécurité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password2"
                    name="password2"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password2}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inscription en cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          {/* Lien vers connexion */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          © 2025 AutoConnect. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
