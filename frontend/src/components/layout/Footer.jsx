import { Link } from 'react-router-dom';
import {
    FiTruck,
    FiMail,
    FiPhone,
    FiMapPin,
    FiFacebook,
    FiTwitter,
    FiInstagram,
    FiLinkedin,
    FiChevronRight
} from 'react-icons/fi';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    // Liens de navigation
    const quickLinks = [
        { path: '/', label: 'Accueil' },
        { path: '/vehicules', label: 'Véhicules' },
        { path: '/concessions', label: 'Concessions' },
        { path: '/about', label: 'À propos' },
        { path: '/contact', label: 'Contact' },
    ];

    // Services
    const services = [
        { path: '/vehicules?type=location', label: 'Location de véhicules' },
        { path: '/vehicules?type=vente', label: 'Vente de véhicules' },
        { path: '/concessions', label: 'Nos concessions' },
        { path: '/how-it-works', label: 'Comment ça marche' },
        { path: '/faq', label: 'FAQ' },
    ];

    // Informations légales
    const legalLinks = [
        { path: '/terms', label: 'Conditions générales' },
        { path: '/privacy', label: 'Politique de confidentialité' },
        { path: '/cookies', label: 'Politique des cookies' },
        { path: '/legal', label: 'Mentions légales' },
    ];

    // Réseaux sociaux
    const socialLinks = [
        { icon: FiFacebook, url: 'https://facebook.com', label: 'Facebook' },
        { icon: FiTwitter, url: 'https://twitter.com', label: 'Twitter' },
        { icon: FiInstagram, url: 'https://instagram.com', label: 'Instagram' },
        { icon: FiLinkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Section principale du footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Colonne 1 : À propos */}
                    <div>
                        <Link to="/" className="flex items-center space-x-3 mb-6 group">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                                <FiTruck className="text-white text-2xl" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                Auto<span className="text-blue-500">Connect</span>
                            </span>
                        </Link>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Votre plateforme de confiance pour la location et la vente de véhicules au Sénégal.
                            Trouvez le véhicule parfait pour vos besoins.
                        </p>

                        {/* Réseaux sociaux */}
                        <div className="flex space-x-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all group"
                                        aria-label={social.label}
                                    >
                                        <Icon className="text-gray-400 group-hover:text-white transition-colors" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Colonne 2 : Liens rapides */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">
                            Liens rapides
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors group"
                                    >
                                        <FiChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Colonne 3 : Services */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">
                            Nos services
                        </h3>
                        <ul className="space-y-3">
                            {services.map((service) => (
                                <li key={service.path}>
                                    <Link
                                        to={service.path}
                                        className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors group"
                                    >
                                        <FiChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                        <span>{service.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Colonne 4 : Contact */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">
                            Contactez-nous
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <FiMapPin className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">
                                        Dakar, Sénégal<br />
                                        Plateau, Rue Mohamed V
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FiPhone className="text-blue-500 text-xl flex-shrink-0" />
                                <a
                                    href="tel:+221123456789"
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    +221 12 345 67 89
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FiMail className="text-blue-500 text-xl flex-shrink-0" />
                                <a
                                    href="mailto:contact@autoconnect.sn"
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    contact@autoconnect.sn
                                </a>
                            </li>
                        </ul>

                        {/* Horaires */}
                        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                            <h4 className="text-white font-medium mb-2">Horaires d'ouverture</h4>
                            <p className="text-gray-400 text-sm">
                                Lundi - Vendredi : 8h - 18h<br />
                                Samedi : 9h - 17h<br />
                                Dimanche : Fermé
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de séparation */}
            <div className="border-t border-gray-800"></div>

            {/* Section inférieure : Copyright et liens légaux */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

                    {/* Copyright */}
                    <div className="text-gray-400 text-sm text-center md:text-left">
                        © {currentYear} <span className="text-blue-500 font-medium">AutoConnect</span>.
                        Tous droits réservés. Développé avec ❤️ au Sénégal.
                    </div>

                    {/* Liens légaux */}
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        {legalLinks.map((link, index) => (
                            <span key={link.path} className="flex items-center">
                                <Link
                                    to={link.path}
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    {link.label}
                                </Link>
                                {index < legalLinks.length - 1 && (
                                    <span className="text-gray-700 mx-2">|</span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newsletter (optionnelle) */}
            <div className="bg-gray-950 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="text-center md:text-left">
                            <h3 className="text-white font-semibold text-lg mb-1">
                                Restez informé
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Recevez nos dernières offres et nouveautés
                            </p>
                        </div>

                        <form className="flex w-full md:w-auto max-w-md">
                            <input
                                type="email"
                                placeholder="Votre adresse email"
                                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-r-lg transition-all"
                            >
                                S'abonner
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </footer>
    );
}