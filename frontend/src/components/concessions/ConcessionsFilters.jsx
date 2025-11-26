import { FiSearch, FiMapPin, FiStar, FiX, FiFilter } from 'react-icons/fi';

export default function ConcessionsFilters({ filters, onChange, onReset }) {
    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    // Compter les filtres actifs
    const activeFiltersCount = Object.values(filters).filter(
        (value) => value !== '' && value !== false
    ).length;

    // Villes du Sénégal
    const villes = [
        'Dakar',
        'Thiès',
        'Saint-Louis',
        'Kaolack',
        'Ziguinchor',
        'Louga',
        'Mbour',
        'Tambacounda',
        'Diourbel',
        'Kolda',
    ];

    // Services disponibles
    const servicesOptions = [
        { value: 'LOCATION', label: 'Location' },
        { value: 'VENTE', label: 'Vente' },
        { value: 'ENTRETIEN', label: 'Entretien' },
        { value: 'LIVRAISON', label: 'Livraison' },
        { value: 'FINANCEMENT', label: 'Financement' },
        { value: 'ASSURANCE', label: 'Assurance' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* En-tête */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <FiFilter className="text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Filtres de recherche</h3>
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={onReset}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                    >
                        <FiX />
                        <span>Réinitialiser</span>
                    </button>
                )}
            </div>

            {/* Filtres */}
            <div className="p-6 space-y-5">
                {/* Recherche par nom */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                            <FiSearch className="text-gray-400" />
                            <span>Rechercher une concession</span>
                        </div>
                    </label>
                    <input
                        type="text"
                        placeholder="Nom de la concession..."
                        value={filters.search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                {/* Grille 2 colonnes pour les autres filtres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Ville */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center space-x-2">
                                <FiMapPin className="text-gray-400" />
                                <span>Ville</span>
                            </div>
                        </label>
                        <select
                            value={filters.ville || ''}
                            onChange={(e) => handleChange('ville', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="">Toutes les villes</option>
                            {villes.map((ville) => (
                                <option key={ville} value={ville}>
                                    {ville}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Note minimale */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center space-x-2">
                                <FiStar className="text-gray-400" />
                                <span>Note minimale</span>
                            </div>
                        </label>
                        <select
                            value={filters.note_min || ''}
                            onChange={(e) => handleChange('note_min', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="">Toutes les notes</option>
                            <option value="4.5">4.5+ étoiles</option>
                            <option value="4.0">4.0+ étoiles</option>
                            <option value="3.5">3.5+ étoiles</option>
                            <option value="3.0">3.0+ étoiles</option>
                        </select>
                    </div>

                    {/* Services */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Services proposés
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {servicesOptions.map((service) => (
                                <label
                                    key={service.value}
                                    className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:border-teal-300 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.services?.includes(service.value) || false}
                                        onChange={(e) => {
                                            const currentServices = filters.services || [];
                                            const newServices = e.target.checked
                                                ? [...currentServices, service.value]
                                                : currentServices.filter(s => s !== service.value);
                                            handleChange('services', newServices);
                                        }}
                                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-gray-700">{service.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Certification */}
                    <div className="md:col-span-2">
                        <label className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={filters.certifiee || false}
                                onChange={(e) => handleChange('certifiee', e.target.checked)}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div className="flex-1">
                                <span className="font-medium text-gray-900">
                                    Concessions certifiées uniquement
                                </span>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Afficher seulement les concessions vérifiées par AutoConnect
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Filtres actifs (tags) */}
            {activeFiltersCount > 0 && (
                <div className="px-6 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Filtres actifs :</span>

                        {filters.search && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">
                                <span>"{filters.search}"</span>
                                <button
                                    onClick={() => handleChange('search', '')}
                                    className="hover:text-teal-900"
                                >
                                    <FiX className="text-xs" />
                                </button>
                            </span>
                        )}

                        {filters.ville && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">
                                <span>{filters.ville}</span>
                                <button
                                    onClick={() => handleChange('ville', '')}
                                    className="hover:text-teal-900"
                                >
                                    <FiX className="text-xs" />
                                </button>
                            </span>
                        )}

                        {filters.note_min && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">
                                <span>Note {filters.note_min}+</span>
                                <button
                                    onClick={() => handleChange('note_min', '')}
                                    className="hover:text-teal-900"
                                >
                                    <FiX className="text-xs" />
                                </button>
                            </span>
                        )}

                        {filters.certifiee && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                <span>Certifiées</span>
                                <button
                                    onClick={() => handleChange('certifiee', false)}
                                    className="hover:text-green-900"
                                >
                                    <FiX className="text-xs" />
                                </button>
                            </span>
                        )}

                        {filters.services && filters.services.length > 0 && (
                            filters.services.map(service => (
                                <span
                                    key={service}
                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
                                >
                                    <span>{servicesOptions.find(s => s.value === service)?.label}</span>
                                    <button
                                        onClick={() => {
                                            const newServices = filters.services.filter(s => s !== service);
                                            handleChange('services', newServices);
                                        }}
                                        className="hover:text-teal-900"
                                    >
                                        <FiX className="text-xs" />
                                    </button>
                                </span>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}