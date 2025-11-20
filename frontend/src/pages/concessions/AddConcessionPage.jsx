import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import concessionService from '../../services/concessionService';
import DashboardLayout from '../../components/layout/DashboardLayout';

function AddConcessionPage() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);

    // Services disponibles
    const servicesDisponibles = [
        'Vente de véhicules neufs',
        'Vente de véhicules d\'occasion',
        'Location courte durée',
        'Location longue durée',
        'Entretien et réparation',
        'Pièces détachées',
        'Lavage auto',
        'Assistance dépannage'
    ];

    // Charger les régions
    useEffect(() => {
        loadRegions();
    }, []);

    const loadRegions = async () => {
        try {
            const data = await concessionService.getAllRegions();
            setRegions(data || []);
        } catch (err) {
            console.error('Erreur chargement régions:', err);
        }
    };

    // Récupérer la position GPS
    const handleGetGPS = async () => {
        try {
            setGpsLoading(true);
            const position = await concessionService.getUserPosition();
            setValue('latitude', position.latitude.toFixed(7));
            setValue('longitude', position.longitude.toFixed(7));
            setError('');
        } catch (err) {
            setError(err.message || 'Erreur de géolocalisation');
        } finally {
            setGpsLoading(false);
        }
    };

    // Soumettre le formulaire
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');

            // Créer le FormData
            const formData = new FormData();

            // Champs texte
            formData.append('nom', data.nom);
            formData.append('description', data.description);
            formData.append('adresse', data.adresse);
            formData.append('ville', data.ville);
            formData.append('code_postal', data.code_postal || '');
            formData.append('region_id', data.region_id);
            formData.append('telephone', data.telephone);
            formData.append('telephone_secondaire', data.telephone_secondaire || '');
            formData.append('email', data.email);
            formData.append('site_web', data.site_web || '');
            formData.append('latitude', data.latitude);
            formData.append('longitude', data.longitude);
            formData.append('numero_registre_commerce', data.numero_registre_commerce);
            formData.append('ouvert_weekend', data.ouvert_weekend || false);

            // Horaires
            const horaires = {
                lundi: { ouvert: true, debut: data.horaire_debut || '08:00', fin: data.horaire_fin || '18:00' },
                mardi: { ouvert: true, debut: data.horaire_debut || '08:00', fin: data.horaire_fin || '18:00' },
                mercredi: { ouvert: true, debut: data.horaire_debut || '08:00', fin: data.horaire_fin || '18:00' },
                jeudi: { ouvert: true, debut: data.horaire_debut || '08:00', fin: data.horaire_fin || '18:00' },
                vendredi: { ouvert: true, debut: data.horaire_debut || '08:00', fin: data.horaire_fin || '18:00' },
                samedi: { ouvert: data.ouvert_weekend, debut: data.horaire_debut || '09:00', fin: data.horaire_fin || '13:00' },
                dimanche: { ouvert: false }
            };
            formData.append('horaires', JSON.stringify(horaires));

            // Services (récupérer les cases cochées)
            const servicesSelectionnes = servicesDisponibles.filter((_, index) =>
                data[`service_${index}`]
            );
            formData.append('services', JSON.stringify(servicesSelectionnes));

            // Images
            if (data.logo && data.logo[0]) {
                formData.append('logo', data.logo[0]);
            }
            if (data.photo_facade && data.photo_facade[0]) {
                formData.append('photo_facade', data.photo_facade[0]);
            }

            await concessionService.createConcession(formData);

            alert('✅ Concession créée avec succès ! Elle est en attente de validation.');
            navigate('/my-concessions');
        } catch (err) {
            setError(err.message || 'Erreur lors de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout title="Ajouter une concession">

                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Ajouter une concession</h1>
                        <p className="text-gray-600 mt-2">Remplissez les informations de votre parking automobile</p>
                    </div>

                    {/* Message d'erreur */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-8 space-y-8">

                        {/* Informations de base */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                📋 Informations de base
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nom */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom de la concession *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('nom', { required: 'Le nom est requis' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: Auto Dakar Premium"
                                    />
                                    {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>}
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        {...register('description', { required: 'La description est requise' })}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Décrivez votre concession, vos services, votre expertise..."
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                </div>

                                {/* Numéro registre commerce */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Numéro de registre de commerce (NINEA) *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('numero_registre_commerce', { required: 'Le numéro est requis' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: SN-DKR-2024-00123"
                                    />
                                    {errors.numero_registre_commerce && <p className="text-red-500 text-sm mt-1">{errors.numero_registre_commerce.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Adresse */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                📍 Adresse
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Adresse */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse complète *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('adresse', { required: 'L\'adresse est requise' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: Route de l'aéroport, Yoff"
                                    />
                                    {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse.message}</p>}
                                </div>

                                {/* Ville */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ville *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('ville', { required: 'La ville est requise' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: Dakar"
                                    />
                                    {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville.message}</p>}
                                </div>

                                {/* Code postal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Code postal
                                    </label>
                                    <input
                                        type="text"
                                        {...register('code_postal')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: 11000"
                                    />
                                </div>

                                {/* Région */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Région *
                                    </label>
                                    <select
                                        {...register('region_id', { required: 'La région est requise' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Sélectionnez une région</option>
                                        {Array.isArray(regions) && regions.length > 0 ? (
                                            regions.map(region => (
                                                <option key={region.id} value={region.id}>
                                                    {region.nom}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Chargement...</option>
                                        )}
                                    </select>
                                    {errors.region_id && <p className="text-red-500 text-sm mt-1">{errors.region_id.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Coordonnées GPS */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                🗺️ Géolocalisation
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Latitude *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0000001"
                                        {...register('latitude', {
                                            required: 'La latitude est requise',
                                            min: { value: 12, message: 'Latitude invalide (min: 12)' },
                                            max: { value: 17, message: 'Latitude invalide (max: 17)' }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: 14.7167"
                                    />
                                    {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Longitude *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0000001"
                                        {...register('longitude', {
                                            required: 'La longitude est requise',
                                            min: { value: -18, message: 'Longitude invalide (min: -18)' },
                                            max: { value: -11, message: 'Longitude invalide (max: -11)' }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: -17.4677"
                                    />
                                    {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="button"
                                        onClick={handleGetGPS}
                                        disabled={gpsLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <FaMapMarkerAlt />
                                        {gpsLoading ? 'Récupération...' : 'Utiliser ma position GPS'}
                                    </button>
                                    <p className="text-sm text-gray-600 mt-2">
                                        💡 Cliquez pour récupérer automatiquement votre position actuelle
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                📞 Contact
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone principal *
                                    </label>
                                    <input
                                        type="tel"
                                        {...register('telephone', {
                                            required: 'Le téléphone est requis',
                                            pattern: {
                                                value: /^\+221[0-9]{9}$/,
                                                message: 'Format: +221XXXXXXXXX'
                                            }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+221781234567"
                                    />
                                    {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone secondaire
                                    </label>
                                    <input
                                        type="tel"
                                        {...register('telephone_secondaire', {
                                            pattern: {
                                                value: /^\+221[0-9]{9}$/,
                                                message: 'Format: +221XXXXXXXXX'
                                            }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+221771234567"
                                    />
                                    {errors.telephone_secondaire && <p className="text-red-500 text-sm mt-1">{errors.telephone_secondaire.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: 'L\'email est requis',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Email invalide'
                                            }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="contact@exemple.sn"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Site web
                                    </label>
                                    <input
                                        type="url"
                                        {...register('site_web')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.exemple.sn"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Horaires */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                🕐 Horaires
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Heure d'ouverture
                                    </label>
                                    <input
                                        type="time"
                                        {...register('horaire_debut')}
                                        defaultValue="08:00"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Heure de fermeture
                                    </label>
                                    <input
                                        type="time"
                                        {...register('horaire_fin')}
                                        defaultValue="18:00"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('ouvert_weekend')}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Ouvert le weekend</span>
                                    </label>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                💡 Ces horaires s'appliqueront du lundi au vendredi
                            </p>
                        </div>

                        {/* Services */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                🔧 Services proposés
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {servicesDisponibles.map((service, index) => (
                                    <label key={index} className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            {...register(`service_${index}`)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{service}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                📸 Images
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Logo de la concession
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register('logo')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (max 5MB)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Photo de la façade
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register('photo_facade')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (max 5MB)</p>
                                </div>
                            </div>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-4 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                            >
                                <FaSave />
                                {loading ? 'Enregistrement...' : 'Créer la concession'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/my-concessions')}
                                className="px-6 py-3 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                            >
                                <FaTimes />
                                Annuler
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 text-center">
                            ⚠️ Votre concession sera soumise à validation par l'administration avant d'être publiée
                        </p>
                    </form>
                </div>
            </DashboardLayout>
        </div>
    );
}

export default AddConcessionPage;