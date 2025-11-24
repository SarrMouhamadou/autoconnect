import {
    FiSearch,
    FiCheckCircle,
    FiCalendar,
    FiSmile
} from 'react-icons/fi';

export default function HowItWorks() {
    // Étapes du processus
    const steps = [
        {
            numero: 1,
            titre: 'Recherchez votre véhicule',
            description: 'Parcourez notre large sélection de véhicules et utilisez nos filtres pour trouver celui qui correspond parfaitement à vos besoins.',
            icon: FiSearch,
            color: 'blue',
            illustration: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        },
        {
            numero: 2,
            titre: 'Comparez et choisissez',
            description: 'Consultez les caractéristiques, les prix, les avis clients et comparez plusieurs véhicules pour faire le meilleur choix.',
            icon: FiCheckCircle,
            color: 'green',
            illustration: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        },
        {
            numero: 3,
            titre: 'Réservez en ligne',
            description: 'Réservez votre véhicule en quelques clics, choisissez vos dates et recevez une confirmation instantanée par email et SMS.',
            icon: FiCalendar,
            color: 'orange',
            illustration: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        },
        {
            numero: 4,
            titre: 'Profitez de votre trajet',
            description: 'Récupérez votre véhicule à la concession choisie et partez à l\'aventure en toute sérénité avec notre assurance complète.',
            icon: FiSmile,
            color: 'purple',
            illustration: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: {
                bg: 'bg-blue-100',
                text: 'text-blue-600',
                border: 'border-blue-200',
                gradient: 'from-blue-500 to-blue-600',
            },
            green: {
                bg: 'bg-green-100',
                text: 'text-green-600',
                border: 'border-green-200',
                gradient: 'from-green-500 to-green-600',
            },
            orange: {
                bg: 'bg-orange-100',
                text: 'text-orange-600',
                border: 'border-orange-200',
                gradient: 'from-orange-500 to-orange-600',
            },
            purple: {
                bg: 'bg-purple-100',
                text: 'text-purple-600',
                border: 'border-purple-200',
                gradient: 'from-purple-500 to-purple-600',
            },
        };
        return colors[color];
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 bg-blue-50 rounded-full mb-4">
                        <span className="text-blue-600 font-semibold text-sm">Comment ça marche</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Louez un véhicule en 4 étapes simples
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        De la recherche à la conduite, nous avons simplifié le processus de location
                        pour vous offrir une expérience fluide et agréable
                    </p>
                </div>

                {/* Timeline des étapes - Version Desktop */}
                <div className="hidden lg:block relative">
                    {/* Ligne de connexion */}
                    <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-green-200 via-orange-200 to-purple-200"></div>

                    <div className="grid grid-cols-4 gap-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const colors = getColorClasses(step.color);

                            return (
                                <div key={step.numero} className="relative">
                                    {/* Numéro de l'étape */}
                                    <div className={`relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                                        <span className="text-white text-2xl font-bold">{step.numero}</span>
                                    </div>

                                    {/* Icône */}
                                    <div className={`w-16 h-16 mx-auto mb-4 ${colors.bg} rounded-2xl flex items-center justify-center`}>
                                        <Icon className={`${colors.text} text-3xl`} />
                                    </div>

                                    {/* Contenu */}
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            {step.titre}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Image illustration */}
                                    <div className="mt-6 rounded-xl overflow-hidden shadow-md">
                                        <img
                                            src={step.illustration}
                                            alt={step.titre}
                                            className="w-full h-40 object-cover"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Version Mobile/Tablet */}
                <div className="lg:hidden space-y-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const colors = getColorClasses(step.color);

                        return (
                            <div key={step.numero} className="relative">
                                {/* Ligne de connexion verticale */}
                                {index < steps.length - 1 && (
                                    <div className={`absolute left-10 top-20 w-1 h-full bg-gradient-to-b ${colors.gradient} opacity-20`}></div>
                                )}

                                <div className="flex gap-6">
                                    {/* Gauche : Numéro + Icône */}
                                    <div className="flex-shrink-0">
                                        <div className={`relative z-10 w-20 h-20 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg mb-4`}>
                                            <span className="text-white text-2xl font-bold">{step.numero}</span>
                                        </div>
                                        <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto`}>
                                            <Icon className={`${colors.text} text-3xl`} />
                                        </div>
                                    </div>

                                    {/* Droite : Contenu */}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {step.titre}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed mb-4">
                                            {step.description}
                                        </p>
                                        <div className="rounded-xl overflow-hidden shadow-md">
                                            <img
                                                src={step.illustration}
                                                alt={step.titre}
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section CTA */}
                <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Prêt à commencer votre aventure ?
                    </h3>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Trouvez le véhicule parfait pour votre prochain voyage en quelques clics
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.location.href = '/vehicules'}
                            className="px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                        >
                            Voir les véhicules
                        </button>
                        <button
                            onClick={() => window.location.href = '/register'}
                            className="px-8 py-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl transition-all"
                        >
                            Créer un compte
                        </button>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                        <div className="text-gray-600">Support client</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                        <div className="text-gray-600">Paiement sécurisé</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
                        <div className="text-gray-600">Véhicules disponibles</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
                        <div className="text-gray-600">Clients satisfaits</div>
                    </div>
                </div>
            </div>
        </section>
    );
}