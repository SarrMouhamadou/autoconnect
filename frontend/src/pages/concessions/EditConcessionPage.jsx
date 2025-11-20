import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import concessionService from '../../services/concessionService';
import DashboardLayout from '../../components/layout/DashboardLayout';

function EditConcessionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

    const [regions, setRegions] = useState([]);
    const [concession, setConcession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
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

    // Charger les données
    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setPageLoading(true);

            // Charger régions et concession en parallèle
            const [regionsData, concessionData] = await Promise.all([
                concessionService.getAllRegions(),
                concessionService.getConcession(id)
            ]);

            setRegions(regionsData || []);
            setConcession(concessionData);

            // Pré-remplir le formulaire
            setValue('nom', concessionData.nom);
            setValue('description', concessionData.description);
            setValue('adresse', concessionData.adresse);
            setValue('ville', concessionData.ville);
            setValue('code_postal', concessionData.code_postal || '');
            setValue('region_id', concessionData.region?.id);
            setValue('telephone', concessionData.telephone);
            setValue('telephone_secondaire', concessionData.telephone_secondaire || '');
            setValue('email', concessionData.email);
            setValue('site_web', concessionData.site_web || '');
            setValue('latitude', concessionData.latitude);
            setValue('longitude', concessionData.longitude);
            setValue('ouvert_weekend', concessionData.ouvert_weekend);

            // Pré-cocher les services
            if (concessionData.services && Array.isArray(concessionData.services)) {
                servicesDisponibles.forEach((service, index) => {
                    if (concessionData.services.includes(service)) {
                        setValue(`service_${index}`, true);
                    }
                });
            }

            // Horaires (prendre le premier jour disponible)
            if (concessionData.horaires && concessionData.horaires.lundi) {
                setValue('horaire_debut', concessionData.horaires.lundi.debut || '08:00');
                setValue('horaire_fin', concessionData.horaires.lundi.fin || '18:00');
            }

        } catch (err) {
            setError(err.message || 'Erreur lors du chargement');
        } finally {
            setPageLoading(false);
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

            // Images (seulement si nouvelles images)
            if (data.logo && data.logo[0]) {
                formData.append('logo', data.logo[0]);
            }
            if (data.photo_facade && data.photo_facade[0]) {
                formData.append('photo_facade', data.photo_facade[0]);
            }

            await concessionService.updateConcession(id, formData);

            alert('✅ Concession modifiée avec succès !');
            navigate('/my-concessions');
        } catch (err) {
            setError(err.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (pageLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardLayout title="Ajouter une concession">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
                            <p className="text-gray-600">Chargement de la concession...</p>
                        </div>
                    </div>
                </DashboardLayout>
            </div>
        );
    }

    // Error state
    if (error && !concession) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DashboardLayout title="Ajouter une concession">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                        <button
                            onClick={() => navigate('/my-concessions')}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            ← Retour à mes concessions
                        </button>
                    </div>
                </DashboardLayout>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardLayout title="Ajouter une concession">

                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Modifier la concession</h1>
                        <p className="text-gray-600 mt-2">{concession?.nom}</p>

                        {/* Statut */}
                        {concession && (
                            <div className="mt-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${concession.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
                                    concession.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                                        concession.statut === 'REJETE' ? 'bg-red-100 text-red-800' :
                                            'bg-orange-100 text-orange-800'
                                    }`}>
                                    {concession.statut === 'VALIDE' ? 'Validé' :
                                        concession.statut === 'EN_ATTENTE' ? 'En attente' :
                                            concession.statut === 'REJETE' ? 'Rejeté' :
                                                'Suspendu'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Message d'erreur */}
                    {error && concession && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {/* Message de rejet */}
                    {concession?.statut === 'REJETE' && concession?.raison_rejet && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold text-red-800 mb-2">⚠️ Raison du rejet :</h3>
                            <p className="text-red-700">{concession.raison_rejet}</p>
                            <p className="text-sm text-red-600 mt-2">
                                Corrigez les informations ci-dessous et soumettez à nouveau pour validation.
                            </p>
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
                                        placeholder="Décrivez votre concession..."
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Adresse */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                📍 Adresse
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse complète *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('adresse', { required: 'L\'adresse est requise' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ville *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('ville', { required: 'La ville est requise' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Code postal
                                    </label>
                                    <input
                                        type="text"
                                        {...register('code_postal')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

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
                                        {gpsLoading ? 'Récupération...' : 'Mettre à jour ma position GPS'}
                                    </button>
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

                            {/* Images actuelles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {concession?.logo && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Logo actuel</p>
                                        <img src={concession.logo} alt="Logo" className="h-32 object-contain border rounded" />
                                    </div>
                                )}
                                {concession?.photo_facade && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Façade actuelle</p>
                                        <img src={concession.photo_facade} alt="Façade" className="h-32 object-cover border rounded" />
                                    </div>
                                )}
                            </div>

                            {/* Nouvelles images */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nouveau logo (optionnel)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register('logo')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Laissez vide pour garder l'actuel</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nouvelle photo de façade (optionnel)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register('photo_facade')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Laissez vide pour garder l'actuelle</p>
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
                                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
                    </form>
                </div>
            </DashboardLayout>
        </div>
    );
}

export default EditConcessionPage;