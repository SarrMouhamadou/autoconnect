import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiCalendar, FiTruck } from 'react-icons/fi';

export default function HeroSection() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        lieu: '',
        dateDebut: '',
        dateFin: '',
        typeVehicule: '',
    });

    // Options pour le type de véhicule
    const typeVehiculeOptions = [
        { value: '', label: 'Tous les types' },
        { value: 'BERLINE', label: 'Berline' },
        { value: 'SUV', label: 'SUV' },
        { value: '4X4', label: '4x4' },
        { value: 'COUPE', label: 'Coupé' },
        { value: 'CITADINE', label: 'Citadine' },
        { value: 'UTILITAIRE', label: 'Utilitaire' },
        { value: 'LUXE', label: 'Luxe' },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();

        // Construire les paramètres de recherche
        const queryParams = new URLSearchParams();

        if (searchParams.lieu) queryParams.append('lieu', searchParams.lieu);
        if (searchParams.dateDebut) queryParams.append('date_debut', searchParams.dateDebut);
        if (searchParams.dateFin) queryParams.append('date_fin', searchParams.dateFin);
        if (searchParams.typeVehicule) queryParams.append('type', searchParams.typeVehicule);

        // Rediriger vers la page des véhicules avec les filtres
        navigate(`/vehicules?${queryParams.toString()}`);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
            {/* Image de fond avec overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/90 z-10"></div>
                <div
                    className="w-full h-full bg-cover bg-center opacity-40"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
                    }}
                ></div>
            </div>

            {/* Contenu principal */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <div className="text-center mb-12">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="text-blue-400 text-sm font-medium">
                            +500 véhicules disponibles
                        </span>
                    </div>

                    {/* Titre principal */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        Découvrez le monde sur roues<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                            avec AutoConnect
                        </span>
                    </h1>

                    {/* Sous-titre */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Louez ou achetez le véhicule parfait pour vos besoins.
                        Simple, rapide et sécurisé.
                    </p>
                </div>

                {/* Barre de recherche */}
                <div className="max-w-5xl mx-auto">
                    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                            {/* Lieu */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lieu de prise en charge
                                </label>
                                <div className="relative">
                                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                    <input
                                        type="text"
                                        name="lieu"
                                        value={searchParams.lieu}
                                        onChange={handleInputChange}
                                        placeholder="Dakar, Thiès..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Date début */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date de début
                                </label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                    <input
                                        type="date"
                                        name="dateDebut"
                                        value={searchParams.dateDebut}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Date fin */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date de fin
                                </label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                    <input
                                        type="date"
                                        name="dateFin"
                                        value={searchParams.dateFin}
                                        onChange={handleInputChange}
                                        min={searchParams.dateDebut || new Date().toISOString().split('T')[0]}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Type de véhicule */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type de véhicule
                                </label>
                                <div className="relative">
                                    <FiTruck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                    <select
                                        name="typeVehicule"
                                        value={searchParams.typeVehicule}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                                    >
                                        {typeVehiculeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Bouton de recherche */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group"
                        >
                            <FiSearch className="text-xl group-hover:scale-110 transition-transform" />
                            <span>Rechercher un véhicule</span>
                        </button>
                    </form>

                    {/* Stats rapides */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">500+</div>
                            <div className="text-gray-300 text-sm">Véhicules</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">50+</div>
                            <div className="text-gray-300 text-sm">Concessions</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">10K+</div>
                            <div className="text-gray-300 text-sm">Clients satisfaits</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">4.8/5</div>
                            <div className="text-gray-300 text-sm">Note moyenne</div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                        <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}