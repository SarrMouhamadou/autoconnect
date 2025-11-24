import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function BrandLogos() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Marques de véhicules disponibles (avec logos SVG ou images)
    const brands = [
        {
            name: 'Toyota',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/200px-Toyota_carlogo.svg.png',
            count: 85,
        },
        {
            name: 'Mercedes-Benz',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png',
            count: 52,
        },
        {
            name: 'BMW',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/BMW_logo_%28gray%29.svg/200px-BMW_logo_%28gray%29.svg.png',
            count: 48,
        },
        {
            name: 'Audi',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Audi_logo_detail.svg/200px-Audi_logo_detail.svg.png',
            count: 42,
        },
        {
            name: 'Volkswagen',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/200px-Volkswagen_logo_2019.svg.png',
            count: 38,
        },
        {
            name: 'Peugeot',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Peugeot_2021.svg/200px-Peugeot_2021.svg.png',
            count: 62,
        },
        {
            name: 'Nissan',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.svg/200px-Nissan_logo.svg.png',
            count: 55,
        },
        {
            name: 'Land Rover',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Land_Rover_logo.svg/200px-Land_Rover_logo.svg.png',
            count: 28,
        },
        {
            name: 'Porsche',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Porsche_Logo.svg/200px-Porsche_Logo.svg.png',
            count: 18,
        },
        {
            name: 'Lexus',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lexus_logo_2020.svg/200px-Lexus_logo_2020.svg.png',
            count: 22,
        },
        {
            name: 'Hyundai',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png',
            count: 45,
        },
        {
            name: 'Kia',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Kia_logo_2020.svg/200px-Kia_logo_2020.svg.png',
            count: 35,
        },
    ];

    const itemsPerPage = 6;
    const totalPages = Math.ceil(brands.length / itemsPerPage);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === totalPages - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? totalPages - 1 : prevIndex - 1
        );
    };

    const getCurrentBrands = () => {
        const start = currentIndex * itemsPerPage;
        const end = start + itemsPerPage;
        return brands.slice(start, end);
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-2 bg-gray-100 rounded-full mb-4">
                        <span className="text-gray-700 font-semibold text-sm">Nos Marques</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Les plus grandes marques automobiles
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Accédez à une sélection exceptionnelle de véhicules des marques les plus prestigieuses
                    </p>
                </div>

                {/* Carousel de logos - Version Desktop */}
                <div className="hidden md:block relative">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {getCurrentBrands().map((brand) => (
                            <div
                                key={brand.name}
                                className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                            >
                                <div className="flex flex-col items-center">
                                    {/* Logo */}
                                    <div className="w-24 h-24 flex items-center justify-center mb-4 grayscale group-hover:grayscale-0 transition-all duration-300">
                                        <img
                                            src={brand.logo}
                                            alt={`${brand.name} logo`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    {/* Nom de la marque */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                                        {brand.name}
                                    </h3>

                                    {/* Nombre de véhicules */}
                                    <div className="text-sm text-gray-500 text-center">
                                        {brand.count} véhicules
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Boutons de navigation */}
                    {totalPages > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 border-2 border-gray-200"
                                aria-label="Marques précédentes"
                            >
                                <FiChevronLeft className="text-gray-700 text-xl" />
                            </button>

                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 border-2 border-gray-200"
                                aria-label="Marques suivantes"
                            >
                                <FiChevronRight className="text-gray-700 text-xl" />
                            </button>
                        </>
                    )}

                    {/* Indicateurs de pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                            ? 'bg-blue-600 w-8'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    aria-label={`Page ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Version Mobile - Grille simple sans carousel */}
                <div className="md:hidden grid grid-cols-2 gap-6">
                    {brands.map((brand) => (
                        <div
                            key={brand.name}
                            className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 flex items-center justify-center mb-3">
                                    <img
                                        src={brand.logo}
                                        alt={`${brand.name} logo`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1 text-center">
                                    {brand.name}
                                </h3>
                                <div className="text-xs text-gray-500 text-center">
                                    {brand.count} véhicules
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Statistiques des marques */}
                <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">12+</div>
                            <div className="text-blue-100 text-lg">Marques partenaires</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                            <div className="text-blue-100 text-lg">Modèles disponibles</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                            <div className="text-blue-100 text-lg">Concessions</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
                            <div className="text-blue-100 text-lg">Véhicules certifiés</div>
                        </div>
                    </div>
                </div>

                {/* CTA final */}
                <div className="mt-12 text-center">
                    <p className="text-lg text-gray-600 mb-6">
                        Vous ne trouvez pas la marque que vous cherchez ?
                    </p>
                    <button
                        onClick={() => window.location.href = '/contact'}
                        className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                        Contactez-nous
                    </button>
                </div>
            </div>
        </section>
    );
}