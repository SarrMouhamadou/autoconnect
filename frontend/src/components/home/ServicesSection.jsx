import {
    FiShield,
    FiDollarSign,
    FiClock,
    FiCheckCircle,
    FiTruck,
    FiHeadphones
} from 'react-icons/fi';

export default function ServicesSection() {
    // Services et avantages principaux
    const mainServices = [
        {
            id: 1,
            titre: 'Qualité Premium',
            description: 'Tous nos véhicules sont régulièrement entretenus et vérifiés pour garantir votre sécurité et votre confort sur la route.',
            icon: FiShield,
            color: 'blue',
            features: [
                'Véhicules récents et bien entretenus',
                'Contrôle technique à jour',
                'Nettoyage professionnel',
                'Assurance tous risques incluse',
            ],
        },
        {
            id: 2,
            titre: 'Prix Compétitifs',
            description: 'Profitez des meilleurs tarifs du marché sans compromettre la qualité. Transparence totale, sans frais cachés.',
            icon: FiDollarSign,
            color: 'green',
            features: [
                'Tarifs transparents et justes',
                'Promotions régulières',
                'Kilométrage illimité disponible',
                'Paiement sécurisé en ligne',
            ],
        },
        {
            id: 3,
            titre: 'Réservation Facile',
            description: 'Réservez votre véhicule en quelques clics, 24h/24 et 7j/7. Service client disponible pour vous accompagner.',
            icon: FiClock,
            color: 'orange',
            features: [
                'Plateforme intuitive et rapide',
                'Confirmation instantanée',
                'Modification flexible',
                'Support client réactif',
            ],
        },
    ];

    // Services supplémentaires
    const additionalServices = [
        {
            titre: 'Large Sélection',
            description: 'Plus de 500 véhicules disponibles',
            icon: FiTruck,
        },
        {
            titre: 'Service Client',
            description: 'Support disponible 24/7',
            icon: FiHeadphones,
        },
        {
            titre: 'Garantie Qualité',
            description: 'Satisfaction client garantie',
            icon: FiCheckCircle,
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: {
                bg: 'bg-blue-50',
                icon: 'bg-blue-100',
                text: 'text-blue-600',
                gradient: 'from-blue-500 to-blue-600',
                hover: 'hover:bg-blue-100',
            },
            green: {
                bg: 'bg-green-50',
                icon: 'bg-green-100',
                text: 'text-green-600',
                gradient: 'from-green-500 to-green-600',
                hover: 'hover:bg-green-100',
            },
            orange: {
                bg: 'bg-orange-50',
                icon: 'bg-orange-100',
                text: 'text-orange-600',
                gradient: 'from-orange-500 to-orange-600',
                hover: 'hover:bg-orange-100',
            },
        };
        return colors[color];
    };

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 bg-blue-50 rounded-full mb-4">
                        <span className="text-blue-600 font-semibold text-sm">Nos Services</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Pourquoi choisir AutoConnect ?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Nous nous engageons à vous offrir la meilleure expérience de location
                        et d'achat de véhicules au Sénégal
                    </p>
                </div>

                {/* Services principaux - 3 colonnes */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {mainServices.map((service) => {
                        const Icon = service.icon;
                        const colors = getColorClasses(service.color);

                        return (
                            <div
                                key={service.id}
                                className={`${colors.bg} rounded-2xl p-8 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2`}
                            >
                                {/* Icône */}
                                <div className={`w-16 h-16 ${colors.icon} rounded-2xl flex items-center justify-center mb-6`}>
                                    <Icon className={`${colors.text} text-3xl`} />
                                </div>

                                {/* Titre et description */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {service.titre}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {service.description}
                                </p>

                                {/* Liste des features */}
                                <ul className="space-y-3">
                                    {service.features.map((feature, index) => (
                                        <li key={index} className="flex items-start space-x-3">
                                            <FiCheckCircle className={`${colors.text} flex-shrink-0 mt-1`} />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Section avec image et texte */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                    {/* Image */}
                    <div className="relative">
                        <div className="rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Service AutoConnect"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Badge flottant */}
                        <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 mb-1">4.8/5</div>
                                <div className="text-gray-600 text-sm">Note moyenne</div>
                                <div className="text-gray-500 text-xs mt-1">+10K avis clients</div>
                            </div>
                        </div>
                    </div>

                    {/* Contenu */}
                    <div>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Une expérience client exceptionnelle
                        </h3>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Chez AutoConnect, nous mettons tout en œuvre pour vous offrir un service
                            de qualité irréprochable. De la réservation à la restitution, notre équipe
                            est à votre écoute pour répondre à tous vos besoins.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FiShield className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Sécurité maximale</h4>
                                    <p className="text-gray-600">Assurance tous risques incluse sur tous nos véhicules</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FiCheckCircle className="text-green-600 text-xl" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Flexibilité totale</h4>
                                    <p className="text-gray-600">Modifiez ou annulez votre réservation facilement</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FiHeadphones className="text-orange-600 text-xl" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Support dédié</h4>
                                    <p className="text-gray-600">Une équipe disponible 24/7 pour vous accompagner</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = '/about'}
                            className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                        >
                            En savoir plus sur nous
                        </button>
                    </div>
                </div>

                {/* Services supplémentaires - 3 cartes compactes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {additionalServices.map((service, index) => {
                        const Icon = service.icon;

                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center"
                            >
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon className="text-blue-600 text-2xl" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">{service.titre}</h4>
                                <p className="text-gray-600 text-sm">{service.description}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Section CTA finale */}
                <div className="mt-16 text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Prêt à vivre l'expérience AutoConnect ?
                    </h3>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Rejoignez des milliers de clients satisfaits et découvrez nos services
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.location.href = '/vehicules'}
                            className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all shadow-lg"
                        >
                            Parcourir les véhicules
                        </button>
                        <button
                            onClick={() => window.location.href = '/contact'}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                        >
                            Nous contacter
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}