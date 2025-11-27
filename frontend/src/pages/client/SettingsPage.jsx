import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import authService from '../services/authService';
import { getMediaUrl, getInitials } from '../utils/helpers';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCamera, FiLock, FiCheck } from 'react-icons/fi';

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);

    // ✅ AJOUTER : États pour la photo
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [formData, setFormData] = useState({
        prenom: user?.prenom || '',
        nom: user?.nom || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        adresse: user?.adresse || '',
        ville: user?.ville || '',
        code_postal: user?.code_postal || '',
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

    // ✅ AJOUTER : Gérer le changement de photo
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Vérifier la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La photo ne doit pas dépasser 5 MB');
                return;
            }

            // Vérifier le type
            if (!file.type.startsWith('image/')) {
                alert('Le fichier doit être une image');
                return;
            }

            setPhotoFile(file);

            // Créer une preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Créer FormData
            const formDataToSend = new FormData();

            // Ajouter les champs texte
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value !== '' && value !== null && value !== undefined) {
                    formDataToSend.append(key, value);
                }
            });

            // Ajouter la photo si elle existe
            if (photoFile) {
                formDataToSend.append('photo_profil', photoFile);
            }

            // Envoyer la requête
            await authService.updateProfile(formDataToSend);

            // Mettre à jour le contexte
            await refreshUser();

            // Réinitialiser les états
            setPhotoFile(null);
            setPhotoPreview(null);

            alert('Profil mis à jour avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscardChanges = () => {
        setFormData({
            prenom: user?.prenom || '',
            nom: user?.nom || '',
            email: user?.email || '',
            telephone: user?.telephone || '',
            adresse: user?.adresse || '',
            ville: user?.ville || '',
            code_postal: user?.code_postal || '',
        });
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            alert('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        try {
            setLoading(true);

            await authService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword,
                passwordData.confirmPassword
            );

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            alert('Mot de passe modifié avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du changement de mot de passe');
        } finally {
            setLoading(false);
        }
    };

    // useEffect pour initialiser formData quand user change
    useEffect(() => {
        if (user) {
            setFormData({
                prenom: user.prenom || '',
                nom: user.nom || '',
                email: user.email || '',
                telephone: user.telephone || '',
                adresse: user.adresse || '',
                ville: user.ville || '',
                code_postal: user.code_postal || '',
            });
        }
    }, [user]);
    
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
                                    {/* ✅ Afficher preview ou photo actuelle */}
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
                                        />
                                    ) : user?.photo_profil ? (
                                        <img
                                            src={getMediaUrl(user.photo_profil)}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white text-4xl font-bold border-4 border-teal-100">
                                            {getInitials(user?.prenom, user?.nom)}
                                        </div>
                                    )}

                                    {/* ✅ Input caché + label comme bouton */}
                                    <input
                                        type="file"
                                        id="photo_profil_input"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="photo_profil_input"
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition shadow-lg border-4 border-white cursor-pointer"
                                    >
                                        <FiCamera className="w-5 h-5" />
                                    </label>
                                </div>
                            </div>

                            {/* Nom et rôle */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {user?.prenom} {user?.nom}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {user?.type_utilisateur === 'CLIENT' ? 'Client' :
                                        user?.type_utilisateur === 'CONCESSIONNAIRE' ? 'Concessionnaire' :
                                            'Administrateur'}
                                </p>
                                {photoFile && (
                                    <p className="text-xs text-green-600 mt-2">
                                        ✅ Nouvelle photo sélectionnée
                                    </p>
                                )}
                            </div>

                            {/* Menu latéral */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'personal'
                                        ? 'bg-teal-50 text-teal-600 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <FiUser className="w-5 h-5" />
                                    <span className="text-sm">Personal Information</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'security'
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
                                                required
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
                                                required
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
                                                disabled
                                                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-500 cursor-not-allowed pr-24"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-green-600 text-sm font-medium">
                                                <FiCheck className="w-4 h-4" />
                                                <span>Verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Téléphone */}
                                    <div className="mb-6">
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

                                    {/* Ville et Code postal */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="ville"
                                                value={formData.ville}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                                            />
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
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Boutons */}
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={handleDiscardChanges}
                                            disabled={loading}
                                            className="flex-1 py-3 px-6 border-2 border-teal-500 text-teal-500 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
                                        >
                                            Discard Changes
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
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
                                                disabled={loading}
                                                className="w-full py-3 px-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium shadow-lg disabled:opacity-50"
                                            >
                                                {loading ? 'Changing...' : 'Change Password'}
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