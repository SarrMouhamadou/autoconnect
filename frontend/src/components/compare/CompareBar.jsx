import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { FiX, FiArrowRight, FiTruck } from 'react-icons/fi';

export default function CompareBar() {
    const { compareList, removeFromCompare, clearCompareList, count } = useCompare();
    const navigate = useNavigate();

    // Ne rien afficher si la liste est vide
    if (count === 0) return null;

    const handleCompare = () => {
        if (count < 2) {
            alert('Ajoutez au moins 2 véhicules pour comparer.');
            return;
        }

        const ids = compareList.join(',');
        navigate(`/compare?ids=${ids}`);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-teal-500 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Icône + Compteur */}
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <FiTruck className="text-white text-xl" />
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="bg-teal-100 text-teal-800 font-bold px-4 py-2 rounded-lg">
                                    {count} / 4
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="flex-1 text-center md:text-left">
                            <p className="font-semibold text-gray-900">
                                {count} véhicule{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-gray-600">
                                {count < 2
                                    ? 'Ajoutez au moins 2 véhicules pour comparer'
                                    : 'Prêt à comparer !'}
                            </p>
                        </div>

                        {/* Boutons */}
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                            {/* Bouton Comparer */}
                            <button
                                onClick={handleCompare}
                                disabled={count < 2}
                                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-teal-500 disabled:hover:to-teal-600 transition-all flex items-center justify-center space-x-2"
                            >
                                <span>Comparer</span>
                                <FiArrowRight />
                            </button>

                            {/* Bouton Vider */}
                            <button
                                onClick={clearCompareList}
                                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex-shrink-0 shadow-lg"
                                title="Vider la sélection"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Liste des véhicules (optionnel, version compacte) */}
                    {count > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {compareList.map((id, index) => (
                                    <div
                                        key={id}
                                        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                                    >
                                        <span className="font-medium text-gray-700">
                                            Véhicule #{index + 1}
                                        </span>
                                        <button
                                            onClick={() => removeFromCompare(id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <FiX className="text-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}