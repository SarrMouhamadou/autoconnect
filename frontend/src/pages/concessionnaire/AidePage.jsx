import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    FiSearch, FiBook, FiHelpCircle, FiMail,
    FiPhone, FiMessageSquare, FiChevronDown,
    FiChevronUp, FiExternalLink, FiAlertCircle,
    FiFileText, FiVideo, FiUsers, FiSettings
} from 'react-icons/fi';

export default function AidePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('TOUS');

    // Catégories d'aide
    const categories = [
        { id: 'TOUS', label: 'Tous les articles', icon: FiBook, count: 24 },
        { id: 'VEHICULES', label: 'Gestion véhicules', icon: FiSettings, count: 8 },
        { id: 'DEMANDES', label: 'Demandes clients', icon: FiMessageSquare, count: 6 },
        { id: 'CONCESSIONS', label: 'Mes concessions', icon: FiUsers, count: 4 },
        { id: 'COMPTE', label: 'Mon compte', icon: FiHelpCircle, count: 6 },
    ];

    // FAQ par catégorie
    const faqData = [
        {
            category: 'VEHICULES',
            question: 'Comment ajouter un nouveau véhicule ?',
            answer: 'Pour ajouter un véhicule : 1) Allez dans "Mes véhicules", 2) Cliquez sur "Ajouter un véhicule", 3) Remplissez tous les champs obligatoires (marque, modèle, année, prix journalier, etc.), 4) Ajoutez au moins 3 photos de qualité, 5) Vérifiez que votre concession est validée. Le véhicule sera publié après validation.'
        },
        {
            category: 'VEHICULES',
            question: 'Pourquoi mon véhicule n\'apparaît pas dans le catalogue ?',
            answer: 'Plusieurs raisons possibles : 1) Le statut est "INDISPONIBLE" ou "MAINTENANCE", 2) Votre concession n\'est pas encore validée par l\'administrateur, 3) Le véhicule manque d\'informations obligatoires (prix, photos, description), 4) Il y a une erreur de validation. Vérifiez ces éléments dans la page de modification du véhicule.'
        },
        {
            category: 'VEHICULES',
            question: 'Comment modifier le prix d\'un véhicule ?',
            answer: 'Allez dans "Mes véhicules", cliquez sur le véhicule à modifier, puis sur "Modifier". Changez le prix journalier et sauvegardez. Le nouveau prix sera appliqué immédiatement pour les nouvelles réservations. Les réservations en cours conservent l\'ancien prix.'
        },
        {
            category: 'VEHICULES',
            question: 'Comment gérer la disponibilité de mes véhicules ?',
            answer: 'Vous pouvez changer le statut de chaque véhicule : DISPONIBLE (visible dans le catalogue), LOUE (automatique lors d\'une location), MAINTENANCE (masqué temporairement), ou INDISPONIBLE (masqué définitivement). Le statut se change depuis la fiche du véhicule.'
        },
        {
            category: 'DEMANDES',
            question: 'Comment répondre à une demande client ?',
            answer: 'Dans la page "Demandes", cliquez sur la demande concernée puis sur "Répondre". Rédigez votre réponse et envoyez. Le client recevra une notification par email et sur la plateforme. Pensez à marquer la demande comme "Traitée" une fois résolue.'
        },
        {
            category: 'DEMANDES',
            question: 'Quelle est la différence entre les types de demandes ?',
            answer: 'CONTACT : demande d\'information générale. ESSAI : demande de test du véhicule avec date et heure. DEVIS : demande de tarification pour une location avec dates précises. INFORMATION : question spécifique sur un véhicule ou service.'
        },
        {
            category: 'DEMANDES',
            question: 'Combien de temps ai-je pour répondre à une demande ?',
            answer: 'Il est recommandé de répondre dans les 24h pour maintenir un bon taux de satisfaction. Les demandes de plus de 48h sans réponse seront marquées en "urgent" dans votre tableau de bord. Un délai moyen de réponse rapide améliore votre note.'
        },
        {
            category: 'CONCESSIONS',
            question: 'Comment créer ma première concession ?',
            answer: 'Lors de votre première connexion, vous serez guidé pour créer votre concession. Renseignez : nom, adresse complète, téléphone, horaires d\'ouverture, et description. Ajoutez des photos de votre établissement. La validation par l\'administrateur prend 24-48h.'
        },
        {
            category: 'CONCESSIONS',
            question: 'Puis-je gérer plusieurs concessions ?',
            answer: 'Oui ! Une fois la première concession validée, vous pouvez ajouter d\'autres établissements via "Mes concessions" → "Ajouter une concession". Chaque concession doit être validée indépendamment. Vous pourrez ensuite affecter vos véhicules à chaque concession.'
        },
        {
            category: 'CONCESSIONS',
            question: 'Comment modifier les informations de ma concession ?',
            answer: 'Allez dans "Mes concessions", sélectionnez la concession à modifier, puis cliquez sur "Modifier". Certains champs (nom, SIRET) nécessitent une revalidation administrative. Les changements d\'horaires et de description sont immédiats.'
        },
        {
            category: 'COMPTE',
            question: 'Comment modifier mes informations personnelles ?',
            answer: 'Cliquez sur "Mon profil" dans le menu latéral, puis sur "Modifier le profil". Vous pouvez changer votre photo, téléphone, adresse, site web et description entreprise. Le nom d\'entreprise et SIRET ne sont modifiables que par l\'administrateur.'
        },
        {
            category: 'COMPTE',
            question: 'Comment changer mon mot de passe ?',
            answer: 'Dans "Mon profil", cliquez sur "Changer le mot de passe". Saisissez votre mot de passe actuel, puis le nouveau (minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial). Vous serez déconnecté automatiquement après le changement.'
        },
        {
            category: 'COMPTE',
            question: 'Comment gérer mes notifications ?',
            answer: 'Allez dans "Paramètres" pour activer/désactiver les notifications : nouvelles demandes, réservations, avis clients, alertes maintenance, et rappels. Vous pouvez choisir de recevoir les notifications par email et/ou sur la plateforme.'
        },
        {
            category: 'COMPTE',
            question: 'Comment créer une promotion ?',
            answer: 'Dans "Promotions", cliquez sur "Créer une promotion". Définissez le nom, le code promo, le pourcentage de réduction (1-100%), les dates de validité, et le nombre d\'utilisations maximum. La promotion sera active immédiatement si cochée.'
        },
        {
            category: 'VEHICULES',
            question: 'Combien de photos puis-je ajouter par véhicule ?',
            answer: 'Vous devez ajouter minimum 3 photos et maximum 10 photos par véhicule. Privilégiez des photos de qualité (extérieur, intérieur, tableau de bord). Format accepté : JPG, PNG. Taille max : 5 MB par photo. La première photo sera l\'image principale.'
        },
        {
            category: 'VEHICULES',
            question: 'Comment fonctionne le système de maintenance ?',
            answer: 'Marquez un véhicule en "MAINTENANCE" pour le retirer temporairement du catalogue. Le véhicule reste visible dans votre liste mais n\'est plus réservable. Une fois la maintenance terminée, repassez-le en "DISPONIBLE".'
        },
        {
            category: 'DEMANDES',
            question: 'Puis-je annuler une demande client ?',
            answer: 'Vous ne pouvez pas supprimer une demande, mais vous pouvez la marquer comme "ANNULEE" si elle n\'est plus pertinente ou si le client s\'est rétracté. Ajoutez une note interne pour expliquer la raison.'
        },
        {
            category: 'COMPTE',
            question: 'Où voir mes statistiques de performance ?',
            answer: 'La page "Statistiques" vous donne un aperçu complet : revenus mensuels, nombre de locations, taux d\'occupation, note moyenne, top véhicules, évolution dans le temps. Vous pouvez filtrer par période (semaine, mois, trimestre, année).'
        },
    ];

    // Guides rapides
    const quickGuides = [
        {
            title: 'Guide de démarrage',
            description: 'Premiers pas sur AutoConnect',
            icon: FiBook,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            items: [
                'Créer votre première concession',
                'Ajouter vos premiers véhicules',
                'Configurer vos tarifs',
                'Gérer les demandes clients'
            ]
        },
        {
            title: 'Optimiser vos annonces',
            description: 'Augmentez votre visibilité',
            icon: FiSettings,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            items: [
                'Prendre de bonnes photos',
                'Rédiger des descriptions attractives',
                'Fixer des prix compétitifs',
                'Utiliser les promotions'
            ]
        },
        {
            title: 'Gérer vos clients',
            description: 'Fidélisez votre clientèle',
            icon: FiUsers,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            items: [
                'Répondre rapidement aux demandes',
                'Maintenir un bon taux de satisfaction',
                'Gérer les avis clients',
                'Créer des offres personnalisées'
            ]
        },
    ];

    // Ressources utiles
    const resources = [
        {
            title: 'Tutoriels vidéo',
            description: 'Apprenez en vidéo',
            icon: FiVideo,
            link: '#',
            color: 'text-red-600'
        },
        {
            title: 'Documentation API',
            description: 'Pour les développeurs',
            icon: FiFileText,
            link: '#',
            color: 'text-blue-600'
        },
        {
            title: 'Blog AutoConnect',
            description: 'Actualités et conseils',
            icon: FiBook,
            link: '#',
            color: 'text-green-600'
        },
    ];

    // Filtrer les FAQs
    const filteredFaqs = faqData.filter(faq => {
        const matchCategory = selectedCategory === 'TOUS' || faq.category === selectedCategory;
        const matchSearch = searchTerm === '' ||
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <DashboardLayout title="Centre d'aide">
            {/* En-tête */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Comment pouvons-nous vous aider ?
                </h1>
                <p className="text-gray-600">
                    Recherchez des réponses ou parcourez nos guides
                </p>
            </div>

            {/* Barre de recherche */}
            <div className="mb-8">
                <div className="max-w-2xl mx-auto relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher dans l'aide..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                    />
                </div>
            </div>

            {/* Guides rapides */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Guides rapides
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickGuides.map((guide, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                        >
                            <div className={`w-12 h-12 ${guide.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                                <guide.icon className={`w-6 h-6 ${guide.color}`} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {guide.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {guide.description}
                            </p>
                            <ul className="space-y-2">
                                {guide.items.map((item, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-gray-700">
                                        <span className="text-teal-600 mr-2">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Questions fréquentes
                </h2>

                {/* Filtres par catégorie */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${selectedCategory === cat.id
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            <cat.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{cat.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === cat.id
                                    ? 'bg-teal-500'
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Liste des FAQs */}
                <div className="bg-white rounded-lg shadow-md">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border-b border-gray-200 last:border-0"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                                >
                                    <div className="flex-1 pr-4">
                                        <h3 className="font-medium text-gray-900">
                                            {faq.question}
                                        </h3>
                                    </div>
                                    {openFaqIndex === index ? (
                                        <FiChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    ) : (
                                        <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openFaqIndex === index && (
                                    <div className="px-6 pb-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">
                                Aucun résultat pour "{searchTerm}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Ressources */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Ressources supplémentaires
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {resources.map((resource, index) => (
                        <a
                            key={index}
                            href={resource.link}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <resource.icon className={`w-6 h-6 ${resource.color} flex-shrink-0`} />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition">
                                            {resource.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {resource.description}
                                        </p>
                                    </div>
                                </div>
                                <FiExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Vous ne trouvez pas ce que vous cherchez ?
                    </h2>
                    <p className="text-gray-600">
                        Notre équipe est là pour vous aider
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {/* Email */}
                    <div className="bg-white rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiMail className="w-6 h-6 text-teal-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Réponse sous 24h
                        </p>
                        <a
                            href="mailto:support@autoconnect.sn"
                            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                        >
                            support@autoconnect.sn
                        </a>
                    </div>

                    {/* Téléphone */}
                    <div className="bg-white rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiPhone className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Lun-Ven 9h-18h
                        </p>
                        <a
                            href="tel:+221338234567"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            +221 33 823 45 67
                        </a>
                    </div>

                    {/* Chat */}
                    <div className="bg-white rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiMessageSquare className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Chat en direct</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Disponible maintenant
                        </p>
                        <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            Démarrer une conversation
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}