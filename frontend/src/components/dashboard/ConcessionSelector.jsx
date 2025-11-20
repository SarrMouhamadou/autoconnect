import { useState } from 'react';
import { FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';

export default function ConcessionSelector({ concessions, selectedConcession, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);

    // Filtrer seulement les concessions validées
    const concessionsValidees = concessions?.filter(c => c.statut === 'VALIDE') || [];

    if (concessionsValidees.length === 0) {
        return null; // Ne rien afficher si aucune concession validée
    }

    if (concessionsValidees.length === 1) {
        // Si une seule concession, afficher juste son nom (pas de sélecteur)
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg border border-teal-200">
                <FaMapMarkerAlt className="text-teal-600" />
                <span className="text-sm font-medium text-teal-700">
                    {concessionsValidees[0].nom}
                </span>
            </div>
        );
    }

    const current = selectedConcession === 'all'
        ? { nom: 'Toutes les concessions', id: 'all' }
        : concessionsValidees.find(c => c.id === selectedConcession) || concessionsValidees[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:border-teal-500 transition shadow-sm"
            >
                <FaMapMarkerAlt className="text-teal-600" />
                <span className="text-sm font-medium text-gray-700">
                    {current.nom}
                </span>
                <FaChevronDown className={`text-gray-400 text-xs transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Overlay pour fermer le dropdown */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu dropdown */}
                    <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                        <div className="py-2">
                            {/* Option "Toutes les concessions" */}
                            <button
                                onClick={() => {
                                    onSelect('all');
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-teal-50 transition ${selectedConcession === 'all' ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-teal-600" />
                                    <div>
                                        <div className="font-medium text-sm">Toutes les concessions</div>
                                        <div className="text-xs text-gray-500">
                                            Vue globale de {concessionsValidees.length} concessions
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <div className="border-t border-gray-200 my-2"></div>

                            {/* Liste des concessions */}
                            {concessionsValidees.map((concession) => (
                                <button
                                    key={concession.id}
                                    onClick={() => {
                                        onSelect(concession.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-teal-50 transition ${selectedConcession === concession.id ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="text-teal-600 mt-1" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{concession.nom}</div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {concession.ville}, {concession.region?.nom}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span>🚗 {concession.nombre_vehicules}</span>
                                                <span>⭐ {concession.note_moyenne.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}