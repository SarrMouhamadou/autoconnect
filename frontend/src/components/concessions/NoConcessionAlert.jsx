import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaPlus } from 'react-icons/fa';

export default function NoConcessionAlert({ concessions, showCreateButton = true }) {
    const hasNoConcession = !concessions || concessions.length === 0;
    const hasOnlyPending = concessions?.length > 0 &&
        !concessions.some(c => c.statut === 'VALIDE');

    if (!hasNoConcession && !hasOnlyPending) {
        return null; // Concession validée existe, ne rien afficher
    }

    return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <FaExclamationTriangle className="text-red-600 text-xl" />
                    </div>
                </div>

                <div className="flex-1">
                    {hasNoConcession ? (
                        <>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                🚫 Aucune concession enregistrée
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Vous devez créer et faire valider une concession avant de pouvoir ajouter des véhicules.
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                ⏳ Concession en attente de validation
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Votre concession est en cours de vérification (24-48h).
                                Vous pourrez ajouter des véhicules dès validation.
                            </p>
                        </>
                    )}

                    {showCreateButton && hasNoConcession && (
                        <Link
                            to="/my-concessions/add"
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
                        >
                            <FaPlus />
                            Créer ma concession
                        </Link>
                    )}

                    {!hasNoConcession && (
                        <Link
                            to="/my-concessions"
                            className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            Voir mes concessions
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}