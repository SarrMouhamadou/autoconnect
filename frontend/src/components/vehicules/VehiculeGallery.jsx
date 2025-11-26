import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';

export default function VehiculeGallery({ photos = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Image par défaut si aucune photo
    const defaultImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

    const images = photos.length > 0
        ? photos.map(photo => photo.image || photo.url || photo)
        : [defaultImage];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleThumbnailClick = (index) => {
        setCurrentIndex(index);
    };

    return (
        <>
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
                {/* Image principale */}
                <div className="relative h-[500px] bg-gray-100">
                    <img
                        src={images[currentIndex]}
                        alt={`Véhicule ${currentIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = defaultImage;
                        }}
                    />

                    {/* Overlay gradient en bas */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>

                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                            >
                                <FiChevronLeft className="text-gray-900 text-xl" />
                            </button>

                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                            >
                                <FiChevronRight className="text-gray-900 text-xl" />
                            </button>
                        </>
                    )}

                    {/* Compteur d'images */}
                    <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Bouton fullscreen */}
                    <button
                        onClick={() => setIsFullscreen(true)}
                        className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/80 transition-all text-white"
                    >
                        <FiMaximize2 />
                    </button>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-6 gap-3">
                            {images.slice(0, 6).map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleThumbnailClick(index)}
                                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                            ? 'border-blue-600 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = defaultImage;
                                        }}
                                    />
                                    {index === 5 && images.length > 6 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-sm">
                                            +{images.length - 6}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Fullscreen */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                    {/* Image fullscreen */}
                    <img
                        src={images[currentIndex]}
                        alt={`Véhicule ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                    />

                    {/* Bouton fermer */}
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-white"
                    >
                        <FiX className="text-2xl" />
                    </button>

                    {/* Navigation fullscreen */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-white"
                            >
                                <FiChevronLeft className="text-2xl" />
                            </button>

                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-white"
                            >
                                <FiChevronRight className="text-2xl" />
                            </button>
                        </>
                    )}

                    {/* Compteur */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white text-lg font-medium">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
}