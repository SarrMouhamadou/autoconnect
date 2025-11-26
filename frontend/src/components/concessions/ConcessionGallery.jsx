import { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';

export default function ConcessionGallery({ photos = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const photosPerPage = 8; // 4×2
    const totalPages = Math.ceil(photos.length / photosPerPage);

    // Calculer les photos à afficher
    const startIndex = (currentPage - 1) * photosPerPage;
    const endIndex = startIndex + photosPerPage;
    const currentPhotos = photos.slice(startIndex, endIndex);

    // Navigation pagination
    const goToPage = (page) => {
        setCurrentPage(page);
        // Scroll vers la galerie
        const element = document.getElementById('gallery-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    // Ouvrir la lightbox
    const openLightbox = (photo, index) => {
        setSelectedPhoto({ ...photo, index: startIndex + index });
    };

    // Fermer la lightbox
    const closeLightbox = () => {
        setSelectedPhoto(null);
    };

    // Navigation dans la lightbox
    const nextPhoto = () => {
        if (selectedPhoto && selectedPhoto.index < photos.length - 1) {
            setSelectedPhoto({ ...photos[selectedPhoto.index + 1], index: selectedPhoto.index + 1 });
        }
    };

    const prevPhoto = () => {
        if (selectedPhoto && selectedPhoto.index > 0) {
            setSelectedPhoto({ ...photos[selectedPhoto.index - 1], index: selectedPhoto.index - 1 });
        }
    };

    // Si pas de photos
    if (photos.length === 0) {
        return (
            <div id="gallery-section" className="bg-white rounded-lg shadow-md p-12 text-center">
                <FiImage className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500">Aucune photo disponible pour le moment</p>
            </div>
        );
    }

    return (
        <>
            <div id="gallery-section" className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* En-tête */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Galerie Photos</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {photos.length} photo{photos.length > 1 ? 's' : ''} des véhicules
                        </p>
                    </div>

                    {/* Compteur de page */}
                    {totalPages > 1 && (
                        <span className="text-sm text-gray-500">
                            Page {currentPage} sur {totalPages}
                        </span>
                    )}
                </div>

                {/* Grille 4×2 */}
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {currentPhotos.map((photo, index) => (
                            <div
                                key={index}
                                className="group relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => openLightbox(photo, index)}
                            >
                                <img
                                    src={photo.image || photo.url || photo}
                                    alt={`Photo ${startIndex + index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* Overlay au hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                    <FiImage className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-3xl" />
                                </div>

                                {/* Numéro de photo */}
                                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {startIndex + index + 1}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mt-8">
                            {/* Bouton Précédent */}
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                <FiChevronLeft />
                                <span className="hidden sm:inline">Précédent</span>
                            </button>

                            {/* Numéros de page */}
                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    // Afficher les 3 premières, les 3 dernières, et la page courante +/- 1
                                    if (
                                        page <= 3 ||
                                        page > totalPages - 3 ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === currentPage
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === 4 || page === totalPages - 3) {
                                        return (
                                            <span key={page} className="px-2 text-gray-400">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Bouton Suivant */}
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                <span className="hidden sm:inline">Suivant</span>
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    {/* Bouton fermer */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                    >
                        <FiX className="text-2xl" />
                    </button>

                    {/* Compteur */}
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                        {selectedPhoto.index + 1} / {photos.length}
                    </div>

                    {/* Image */}
                    <div
                        className="relative max-w-6xl max-h-[90vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedPhoto.image || selectedPhoto.url || selectedPhoto}
                            alt={`Photo ${selectedPhoto.index + 1}`}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Navigation */}
                    {selectedPhoto.index > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prevPhoto();
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <FiChevronLeft className="text-3xl" />
                        </button>
                    )}

                    {selectedPhoto.index < photos.length - 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                nextPhoto();
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <FiChevronRight className="text-3xl" />
                        </button>
                    )}
                </div>
            )}
        </>
    );
}