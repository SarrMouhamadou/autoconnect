import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import authService from '../../services/authService';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

export default function ChangePasswordPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password2: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.old_password || !formData.new_password || !formData.new_password2) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.new_password !== formData.new_password2) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (formData.old_password === formData.new_password) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    try {
      setLoading(true);

      await authService.changePassword(
        formData.old_password,
        formData.new_password,
        formData.new_password2
      );

      setSuccess(true);

      setTimeout(async () => {
        await logout();
        navigate('/login', {
          state: { message: 'Mot de passe modifié avec succès. Veuillez vous reconnecter.' }
        });
      }, 3000);

    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Faible', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Moyen', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Bon', color: 'bg-blue-500' };
    return { strength, label: 'Excellent', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  return (
    <DashboardLayout title="Changer mon mot de passe">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/concessionnaire/profil"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-1" />
            Retour au profil
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Changer mon mot de passe</h1>
          <p className="text-gray-600 mt-1">
            Pour votre sécurité, choisissez un mot de passe fort et unique
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Mot de passe modifié avec succès !</p>
                    <p className="text-sm">Vous allez être déconnecté...</p>
                  </div>
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

            {/* Ancien mot de passe */}
            <div>
              <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="old_password"
                  name="old_password"
                  type={showPasswords.old ? "text" : "password"}
                  required
                  value={formData.old_password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Entrez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.old ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="new_password"
                  name="new_password"
                  type={showPasswords.new ? "text" : "password"}
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Minimum 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              {/* Indicateur de force */}
              {formData.new_password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Force du mot de passe :</span>
                    <span className={`text-xs font-medium ${passwordStrength.strength <= 2 ? 'text-red-600' :
                        passwordStrength.strength <= 3 ? 'text-yellow-600' :
                          passwordStrength.strength <= 4 ? 'text-blue-600' :
                            'text-green-600'
                      }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Conseils */}
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p>Le mot de passe doit contenir :</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li className={formData.new_password.length >= 8 ? 'text-green-600' : ''}>
                    Au moins 8 caractères
                  </li>
                  <li className={/[A-Z]/.test(formData.new_password) ? 'text-green-600' : ''}>
                    Une lettre majuscule
                  </li>
                  <li className={/[a-z]/.test(formData.new_password) ? 'text-green-600' : ''}>
                    Une lettre minuscule
                  </li>
                  <li className={/\d/.test(formData.new_password) ? 'text-green-600' : ''}>
                    Un chiffre
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password) ? 'text-green-600' : ''}>
                    Un caractère spécial (!@#$%...)
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label htmlFor="new_password2" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="new_password2"
                  name="new_password2"
                  type={showPasswords.confirm ? "text" : "password"}
                  required
                  value={formData.new_password2}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Confirmez le nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {formData.new_password2 && formData.new_password !== formData.new_password2 && (
                <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
              )}
              {formData.new_password2 && formData.new_password === formData.new_password2 && (
                <p className="mt-1 text-xs text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            {/* Avertissement */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Important</p>
                  <p className="mt-1">
                    Après avoir changé votre mot de passe, vous serez automatiquement déconnecté et devrez vous reconnecter.
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Link
                to="/concessionnaire/profil"
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading || success}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}