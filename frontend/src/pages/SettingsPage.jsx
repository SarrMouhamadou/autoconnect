import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCamera, FiLock, FiCheck } from 'react-icons/fi';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    prenom: user?.prenom || 'Iba Gaye',
    nom: user?.nom || 'SARR',
    email: user?.email || 'igsarr@gmail.com',
    telephone: user?.telephone || '+221778004342',
    adresse: user?.adresse || 'Mérina Gueye',
    ville: user?.ville || 'Thies',
    code_postal: user?.code_postal || '12000',
    date_naissance: '1995-02-01',
    sexe: 'male'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    console.log('Mise à jour du profil:', formData);
    setIsEditing(false);
    alert('Profil mis à jour avec succès !');
  };

  const handleDiscardChanges = () => {
    setFormData({
      prenom: user?.prenom || 'Iba Gaye',
      nom: user?.nom || 'SARR',
      email: user?.email || 'igsarr@gmail.com',
      telephone: user?.telephone || '+221778004342',
      adresse: user?.adresse || 'Mérina Gueye',
      ville: user?.ville || 'Thies',
      code_postal: user?.code_postal || '12000',
      date_naissance: '1995-02-01',
      sexe: 'male'
    });
    setIsEditing(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    console.log('Changement de mot de passe');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert('Mot de passe modifié avec succès !');
  };

  return (
    <DashboardLayout title="Paramètres">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Photo de profil */}
              <div className="relative mb-6 flex justify-center">
                <div className="relative">
                  {user?.photo_profil ? (
                    <img
                      src={user.photo_profil}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white text-4xl font-bold border-4 border-teal-100">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition shadow-lg border-4 border-white">
                    <FiCamera className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Nom et rôle */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {formData.prenom} {formData.nom}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {user?.type_utilisateur === 'CLIENT' ? 'Client' : 'Concessionnaire'}
                </p>
              </div>

              {/* Menu latéral */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'personal'
                      ? 'bg-teal-50 text-teal-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FiUser className="w-5 h-5" />
                  <span className="text-sm">Personal Information</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'security'
                      ? 'bg-teal-50 text-teal-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FiLock className="w-5 h-5" />
                  <span className="text-sm">Login & Password</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-8">
              
              {/* PERSONAL INFORMATION TAB */}
              {activeTab === 'personal' && (
                <form onSubmit={handleSaveProfile}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

                  {/* Sexe - Radio buttons */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sexe"
                          value="male"
                          checked={formData.sexe === 'male'}
                          onChange={handleChange}
                          className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal--00"
                        />
                        <span className="text-sm font-medium text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sexe"
                          value="female"
                          checked={formData.sexe === 'female'}
                          onChange={handleChange}
                          className="w-4 h-4 text-teal-500 border-gray-300 focus:ring-teal-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Female</span>
                      </label>
                    </div>
                  </div>

                  {/* Prénom et Nom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition pr-24"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-green-600 text-sm font-medium">
                        <FiCheck className="w-4 h-4" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Adresse */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Téléphone et Date de naissance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="date_naissance"
                          value={formData.date_naissance}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ville et Code postal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Location
                      </label>
                      <select
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition appearance-none"
                      >
                        <option value="Thies">Thies</option>
                        <option value="Dakar">Dakar</option>
                        <option value="Saint-Louis">Saint-Louis</option>
                        <option value="Ziguinchor">Ziguinchor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="code_postal"
                        value={formData.code_postal}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleDiscardChanges}
                      className="flex-1 py-3 px-6 border-2 border-teal-500 text-teal-500 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-6 bg-teal-600 text-black rounded-lg hover:bg-gray-100 transition font-medium shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* LOGIN & PASSWORD TAB */}
              {activeTab === 'security' && (
                <form onSubmit={handleChangePassword}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Login & Password</h2>

                  <div className="max-w-md">
                    <div className="space-y-6">
                      {/* Mot de passe actuel */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                          placeholder="Enter current password"
                        />
                      </div>

                      {/* Nouveau mot de passe */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          New Password *
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                          placeholder="Minimum 8 characters"
                        />
                      </div>

                      {/* Confirmer mot de passe */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    {/* Bouton */}
                    <div className="mt-8">
                      <button
                        type="submit"
                        className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-600 transition font-medium shadow-lg"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}