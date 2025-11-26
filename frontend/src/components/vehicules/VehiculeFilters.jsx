import { useState, useEffect } from 'react';
import {
    FiX,
    FiFilter,
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';

export default function VehiculeFilters({ filters, onFilterChange, onReset, marques, categories }) {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        type: true,
        marque: true,
        categorie: true,
        prix: true,
        caracteristiques: false,
    });

    // Options type d'offre
    const typeOffreOptions = [
        { value: '', label: 'Tous' },
        { value: 'LOCATION', label: 'Location' },
        { value: 'VENTE', label: 'Vente' },
        { value: 'LOCATION_VENTE', label: 'Location & Vente' },
    ];

    // Options transmission
    const transmissionOptions = [
        'Manuelle',
        'Automatique',
        'Semi-automatique',
    ];

    // Options carburant
    const carburantOptions = [
        'Essence',
        'Diesel',
        'Électrique',
        'Hybride',
    ];

    // Toggle section
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Gérer les changements de filtres
    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    // Compter les filtres actifs
    const countActiveFilters = () => {
        let count = 0;
        if (filters.type_offre) count++;
        if (filters.marque) count++;
        if (filters.categorie) count++;
        if (filters.prix_min || filters.prix_max) count++;
        if (filters.transmission) count++;
        if (filters.carburant) count++;
        if (filters.places_min) count++;
        return count;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FiFilter className="text-gray-600 text-xl" />
                    <h3 className="text-xl font-bold text-gray-900">Filtres</h3>
                    {countActiveFilters() > 0 && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {countActiveFilters()}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onReset}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        Réinitialiser
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                </div>
            </div>

            {/* Filtres */}
            <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">

                    {/* Type d'offre */}
                    <div>
                        <button
                            onClick={() => toggleSection('type')}
                            className="w-full flex items-center justify-between mb-3 font-semibold text-gray-900"
                        >
                            <span>Type d'offre</span>
                            {expandedSections.type ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSections.type && (
                            <div className="space-y-2">
                                {typeOffreOptions.map(option => (
                                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="type_offre"
                                            value={option.value}
                                            checked={filters.type_offre === option.value}
                                            onChange={(e) => handleChange('type_offre', e.target.value)}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 group-hover:text-gray-900">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Marque */}
                    <div className="border-t border-gray-200 pt-6">
                        <button
                            onClick={() => toggleSection('marque')}
                            className="w-full flex items-center justify-between mb-3 font-semibold text-gray-900"
                        >
                            <span>Marque</span>
                            {expandedSections.marque ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSections.marque && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="marque"
                                        value=""
                                        checked={!filters.marque}
                                        onChange={(e) => handleChange('marque', '')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 group-hover:text-gray-900">
                                        Toutes les marques
                                    </span>
                                </label>
                                {marques && marques.map(marque => (
                                    <label key={marque.id} className="flex items-center space-x-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="marque"
                                            value={marque.id}
                                            checked={filters.marque === marque.id}
                                            onChange={(e) => handleChange('marque', e.target.value)}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 group-hover:text-gray-900">
                                            {marque.nom}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Catégorie */}
                    <div className="border-t border-gray-200 pt-6">
                        <button
                            onClick={() => toggleSection('categorie')}
                            className="w-full flex items-center justify-between mb-3 font-semibold text-gray-900"
                        >
                            <span>Catégorie</span>
                            {expandedSections.categorie ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSections.categorie && (
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="categorie"
                                        value=""
                                        checked={!filters.categorie}
                                        onChange={(e) => handleChange('categorie', '')}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 group-hover:text-gray-900">
                                        Toutes les catégories
                                    </span>
                                </label>
                                {categories && categories.map(categorie => (
                                    <label key={categorie.id} className="flex items-center space-x-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="categorie"
                                            value={categorie.id}
                                            checked={filters.categorie === categorie.id}
                                            onChange={(e) => handleChange('categorie', e.target.value)}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 group-hover:text-gray-900">
                                            {categorie.nom}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Prix */}
                    <div className="border-t border-gray-200 pt-6">
                        <button
                            onClick={() => toggleSection('prix')}
                            className="w-full flex items-center justify-between mb-3 font-semibold text-gray-900"
                        >
                            <span>Prix (FCFA)</span>
                            {expandedSections.prix ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSections.prix && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Prix minimum</label>
                                    <input
                                        type="number"
                                        value={filters.prix_min || ''}
                                        onChange={(e) => handleChange('prix_min', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Prix maximum</label>
                                    <input
                                        type="number"
                                        value={filters.prix_max || ''}
                                        onChange={(e) => handleChange('prix_max', e.target.value)}
                                        placeholder="100000000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Caractéristiques */}
                    <div className="border-t border-gray-200 pt-6">
                        <button
                            onClick={() => toggleSection('caracteristiques')}
                            className="w-full flex items-center justify-between mb-3 font-semibold text-gray-900"
                        >
                            <span>Caractéristiques</span>
                            {expandedSections.caracteristiques ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {expandedSections.caracteristiques && (
                            <div className="space-y-4">
                                {/* Transmission */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Transmission</label>
                                    <select
                                        value={filters.transmission || ''}
                                        onChange={(e) => handleChange('transmission', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Toutes</option>
                                        {transmissionOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Carburant */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Carburant</label>
                                    <select
                                        value={filters.carburant || ''}
                                        onChange={(e) => handleChange('carburant', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Tous</option>
                                        {carburantOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Nombre de places */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Nombre de places minimum</label>
                                    <input
                                        type="number"
                                        value={filters.places_min || ''}
                                        onChange={(e) => handleChange('places_min', e.target.value)}
                                        placeholder="2"
                                        min="2"
                                        max="9"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Disponibilité */}
                    <div className="border-t border-gray-200 pt-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.disponible || false}
                                onChange={(e) => handleChange('disponible', e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium text-gray-900">
                                Uniquement les véhicules disponibles
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}