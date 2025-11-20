import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

export default function ConcessionRequiredAlert({ concessions, onDismiss }) {
    const [isDismissed, setIsDismissed] = useState(false);

    // Ne pas afficher si déjà dismiss ou si concessions validées existent
    const hasValidConcession = concessions?.some(c => c.statut === 'VALIDE');
    const hasNoConcession = !concessions || concessions.length === 0;
    const hasOnlyPendingConcessions = concessions?.length > 0 && !hasValidConcession;

    if (isDismissed || hasValidConcession) {
        return null;
    }

    const handleDismiss = () => {
        setIsDismissed(true);
        if (onDismiss) onDismiss();
    };

    return (
        <div className="mb-6">
            {/* Alert pour aucune concession */}
            {hasNoConcession && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md relative">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <FaExclamationTriangle className="text-red-600 text-xl" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                ⚠️ Action requise : Créez votre concession
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Pour commencer à ajouter des véhicules sur la plateforme, vous devez d'abord créer et
                                enregistrer votre concession automobile. Cette étape est obligatoire et permet de valider
                                votre activité.
                            </p>

                            <div className="bg-white/50 rounded-lg p-4 mb-4 border border-red-200">
                                <h4 className="font-semibold text-gray-900 mb-2">📋 Ce dont vous aurez besoin :</h4>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li>✓ Informations de votre concession (nom, adresse, téléphone)</li>
                                    <li>✓ Numéro de registre de commerce (NINEA)</li>
                                    <li>✓ Position GPS de votre établissement</li>
                                    <li>✓ Logo et photo de façade (optionnel)</li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <Link
                                    to="/my-concessions/add"
                                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
                                >
                                    <FaPlus />
                                    Créer ma concession maintenant
                                </Link>
                                <button
                                    onClick={handleDismiss}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                                >
                                    Plus tard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert pour concession en attente */}
            {hasOnlyPendingConcessions && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md relative">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FaExclamationTriangle className="text-yellow-600 text-xl" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                ⏳ Concession en attente de validation
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Votre concession est actuellement en cours de vérification par notre équipe.
                                Vous pourrez ajouter des véhicules dès que votre concession sera validée.
                                Ce processus prend généralement <strong>24 à 48 heures</strong>.
                            </p>

                            <div className="bg-white/50 rounded-lg p-4 mb-4 border border-yellow-200">
                                <h4 className="font-semibold text-gray-900 mb-2">📊 Statut de vos concessions :</h4>
                                <div className="space-y-2">
                                    {concessions.map((concession) => (
                                        <div key={concession.id} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">{concession.nom}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${concession.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                    concession.statut === 'REJETE' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {concession.statut === 'EN_ATTENTE' ? '⏳ En attente' :
                                                    concession.statut === 'REJETE' ? '❌ Rejetée' :
                                                        concession.statut}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Link
                                    to="/my-concessions"
                                    className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition"
                                >
                                    Voir mes concessions
                                </Link>
                                <button
                                    onClick={handleDismiss}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                                >
                                    J'ai compris
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}