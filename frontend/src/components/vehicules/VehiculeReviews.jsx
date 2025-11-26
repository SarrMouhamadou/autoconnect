import { FiStar } from 'react-icons/fi';

export default function VehiculeReviews({ avis = [] }) {
    // Calculer les statistiques si on a des avis
    const calculateStats = () => {
        if (!avis || avis.length === 0) {
            return {
                average: 0,
                total: 0,
                distribution: {
                    5: 0,
                    4: 0,
                    3: 0,
                    2: 0,
                    1: 0,
                },
            };
        }

        const total = avis.length;
        const sum = avis.reduce((acc, review) => acc + review.note, 0);
        const average = (sum / total).toFixed(2);

        const distribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

        avis.forEach((review) => {
            distribution[review.note]++;
        });

        return { average, total, distribution };
    };

    const stats = calculateStats();

    const renderStars = (rating) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`${star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                        size={18}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getPercentage = (count) => {
        return stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
    };

    // Exemple d'avis par défaut si pas d'avis
    const defaultReviews = [
        {
            id: 1,
            auteur: 'Jean Dupont',
            note: 5,
            commentaire: 'Excellent véhicule, très bien entretenu. Le concessionnaire est professionnel et à l\'écoute.',
            date: new Date().toISOString(),
            avatar: null,
        },
        {
            id: 2,
            auteur: 'Marie Martin',
            note: 4,
            commentaire: 'Très satisfaite de ma location. Véhicule propre et conforme à la description.',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            avatar: null,
        },
    ];

    const reviewsToDisplay = avis.length > 0 ? avis : defaultReviews;
    const statsToDisplay = avis.length > 0 ? stats : calculateStats();

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Avis clients</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Carte de note globale */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                        {statsToDisplay.average || '4.96'}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                        {renderStars(Math.round(parseFloat(statsToDisplay.average || 4.96)))}
                    </div>
                    <div className="text-sm text-gray-600">
                        Basé sur {statsToDisplay.total || reviewsToDisplay.length} avis
                    </div>

                    {/* Distribution des notes */}
                    <div className="mt-6 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center space-x-2 text-sm">
                                <span className="w-12 text-left text-gray-600">{star} ⭐</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{
                                            width: `${getPercentage(statsToDisplay.distribution[star])}%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="w-10 text-right text-gray-600">
                                    {getPercentage(statsToDisplay.distribution[star])}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Liste des avis */}
                <div className="lg:col-span-2 space-y-6">
                    {reviewsToDisplay.slice(0, 3).map((review) => (
                        <div
                            key={review.id}
                            className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {review.auteur ? review.auteur.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {review.auteur || 'Utilisateur'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {formatDate(review.date)}
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-gray-900">
                                        {review.note}
                                    </span>
                                    <FiStar className="text-yellow-400 fill-yellow-400" size={20} />
                                </div>
                            </div>

                            {/* Titre de l'avis si présent */}
                            {review.titre && (
                                <h4 className="font-semibold text-gray-900 mb-2">{review.titre}</h4>
                            )}

                            {/* Commentaire */}
                            <p className="text-gray-700 leading-relaxed">{review.commentaire}</p>
                        </div>
                    ))}

                    {/* Bouton voir tous les avis */}
                    {reviewsToDisplay.length > 3 && (
                        <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                            Voir tous les avis ({reviewsToDisplay.length})
                        </button>
                    )}

                    {/* Message si aucun avis */}
                    {avis.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>Aucun avis pour le moment.</p>
                            <p className="text-sm mt-2">
                                Soyez le premier à laisser un avis sur ce véhicule !
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}