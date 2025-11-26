import { FiStar, FiMapPin, FiPhone, FiMail, FiCheckCircle } from 'react-icons/fi';

export default function ConcessionHero({ concession }) {
    // Image par défaut si pas de logo
    const defaultImage = 'https://images.unsplash.com/photo-1562911791-c7a97b729ec5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

    const scrollToVehicules = () => {
        const element = document.getElementById('vehicules-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const scrollToContact = () => {
        const element = document.getElementById('contact-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
            {/* Image de fond avec overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                    backgroundImage: `url(${concession.logo || defaultImage})`,
                }}
            />

            {/* Contenu */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    {/* Colonne gauche - Informations principales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Logo de la concession */}
                        {concession.logo && (
                            <div className="inline-block">
                                <img
                                    src={concession.logo}
                                    alt={concession.nom_entreprise}
                                    className="h-20 w-auto object-contain bg-white rounded-lg p-2 shadow-lg"
                                />
                            </div>
                        )}

                        {/* Nom + Badge validation */}
                        <div className="flex items-start space-x-3">
                            <div className="flex-1">
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    {concession.nom_entreprise || 'Concession'}
                                </h1>

                                {/* Badge certifié */}
                                {concession.statut_validation === 'VALIDEE' && (
                                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500 rounded-full">
                                        <FiCheckCircle className="text-green-400" />
                                        <span className="text-sm font-medium text-green-300">
                                            Concession certifiée
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Note et avis */}
                        {concession.note_moyenne && (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar
                                            key={i}
                                            className={`${i < Math.floor(concession.note_moyenne)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-500'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xl font-bold text-white">
                                    {concession.note_moyenne.toFixed(1)}
                                </span>
                                <span className="text-gray-300">
                                    ({concession.nombre_avis || 0} avis)
                                </span>
                            </div>
                        )}

                        {/* Localisation */}
                        <div className="flex items-start space-x-2 text-gray-300">
                            <FiMapPin className="mt-1 flex-shrink-0 text-teal-400" />
                            <div>
                                <p className="text-lg">
                                    {concession.adresse}
                                </p>
                                {concession.ville && concession.region && (
                                    <p className="text-sm text-gray-400">
                                        {concession.ville}, {concession.region}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Contact rapide */}
                        <div className="flex flex-wrap gap-3">
                            {concession.telephone_entreprise && (
                                <a
                                    href={`tel:${concession.telephone_entreprise}`}
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg transition-colors"
                                >
                                    <FiPhone />
                                    <span className="text-sm">{concession.telephone_entreprise}</span>
                                </a>
                            )}

                            {concession.email && (
                                <a
                                    href={`mailto:${concession.email}`}
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg transition-colors"
                                >
                                    <FiMail />
                                    <span className="text-sm">{concession.email}</span>
                                </a>
                            )}
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={scrollToVehicules}
                                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                Voir les véhicules
                            </button>

                            <button
                                onClick={scrollToContact}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 border-2 border-white text-white font-semibold rounded-lg transition-all"
                            >
                                Nous contacter
                            </button>
                        </div>
                    </div>

                    {/* Colonne droite - Stats rapides */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                En quelques chiffres
                            </h3>

                            {/* Stat 1 */}
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-300">Véhicules</span>
                                <span className="text-2xl font-bold text-teal-400">
                                    {concession.nombre_vehicules || 0}
                                </span>
                            </div>

                            {/* Stat 2 */}
                            {concession.note_moyenne && (
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-gray-300">Note moyenne</span>
                                    <span className="text-2xl font-bold text-yellow-400">
                                        {concession.note_moyenne.toFixed(1)}/5
                                    </span>
                                </div>
                            )}

                            {/* Stat 3 */}
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-300">Expérience</span>
                                <span className="text-2xl font-bold text-purple-400">
                                    {concession.annees_experience || 'N/A'} ans
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vague décorative en bas */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                >
                    <path
                        d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
                        fill="white"
                    />
                </svg>
            </div>
        </div>
    );
}