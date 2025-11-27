import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    FiHelpCircle, FiChevronDown, FiChevronUp, FiMail,
    FiPhone, FiMessageSquare, FiBook, FiSearch
} from 'react-icons/fi';

export default function AidePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categorieActive, setCategorieActive] = useState('TOUT');
    const [faqOuverte, setFaqOuverte] = useState(null);

    const categories = [
        { id: 'TOUT', nom: 'Tout', icone: FiBook },
        { id: 'COMPTE', nom: 'Mon compte', icone: FiHelpCircle },
        { id: 'RESERVATION', nom: 'Réservation', icone: FiMessageSquare },
        { id: 'PAIEMENT', nom: 'Paiement', icone: FiMessageSquare },
        { id: 'ASSISTANCE', nom: 'Assistance', icone: FiPhone },
    ];

    const faqData = [
        {
            categorie: 'COMPTE',
            question: 'Comment créer un compte ?',
            reponse: 'Pour créer un compte sur AutoConnect, cliquez sur le bouton "S\'inscrire" en haut à droite de la page d\'accueil. Remplissez le formulaire avec vos informations personnelles (nom, prénom, email, téléphone) et créez un mot de passe sécurisé. Vous recevrez un email de confirmation pour activer votre compte.'
        },
        {
            categorie: 'COMPTE',
            question: 'Comment modifier mes informations personnelles ?',
            reponse: 'Accédez à votre tableau de bord, puis cliquez sur "Mon profil" dans le menu. Vous pourrez modifier vos informations personnelles, votre photo de profil, et vos coordonnées. N\'oubliez pas de cliquer sur "Enregistrer" pour sauvegarder vos modifications.'
        },
        {
            categorie: 'COMPTE',
            question: 'J\'ai oublié mon mot de passe, que faire ?',
            reponse: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Entrez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe. Le lien est valable pendant 24 heures.'
        },
        {
            categorie: 'RESERVATION',
            question: 'Comment réserver un véhicule ?',
            reponse: 'Parcourez notre catalogue de véhicules, sélectionnez celui qui vous intéresse, puis cliquez sur "Réserver". Remplissez le formulaire avec vos dates de location et vos informations. Une fois votre demande envoyée, le concessionnaire la validera et vous recevrez une confirmation par email.'
        },
        {
            categorie: 'RESERVATION',
            question: 'Puis-je annuler ma réservation ?',
            reponse: 'Oui, vous pouvez annuler une réservation avant sa confirmation par le concessionnaire. Accédez à "Mes locations", sélectionnez la réservation concernée et cliquez sur "Annuler". Si la réservation est déjà confirmée, contactez le concessionnaire directement pour discuter des conditions d\'annulation.'
        },
        {
            categorie: 'RESERVATION',
            question: 'Combien de temps avant ma location dois-je réserver ?',
            reponse: 'Nous recommandons de réserver au moins 48 heures à l\'avance pour garantir la disponibilité du véhicule. Cependant, certains concessionnaires acceptent les réservations de dernière minute. Vérifiez la disponibilité en temps réel sur la fiche du véhicule.'
        },
        {
            categorie: 'PAIEMENT',
            question: 'Quels sont les moyens de paiement acceptés ?',
            reponse: 'AutoConnect accepte les paiements par carte bancaire (Visa, Mastercard), mobile money (Orange Money, Wave, Free Money) et virement bancaire. Le paiement s\'effectue directement auprès du concessionnaire lors de la prise en charge du véhicule.'
        },
        {
            categorie: 'PAIEMENT',
            question: 'Qu\'est-ce que la caution et quand est-elle restituée ?',
            reponse: 'La caution est une garantie demandée par le concessionnaire pour couvrir d\'éventuels dommages. Son montant varie selon le véhicule. Elle est restituée intégralement à la fin de la location si le véhicule est rendu en bon état, généralement sous 3 à 7 jours ouvrés.'
        },
        {
            categorie: 'PAIEMENT',
            question: 'Y a-t-il des frais cachés ?',
            reponse: 'Non, tous les frais sont transparents et affichés lors de la réservation : prix de location journalier, caution, frais éventuels (conducteur additionnel, assurance complémentaire). Le prix total final est clairement indiqué avant la validation de votre réservation.'
        },
        {
            categorie: 'ASSISTANCE',
            question: 'Comment contacter le support ?',
            reponse: 'Vous pouvez nous contacter par email à support@autoconnect.sn, par téléphone au +221 33 XXX XX XX, ou via le formulaire de contact disponible sur notre site. Notre équipe est disponible du lundi au samedi de 8h à 19h.'
        },
        {
            categorie: 'ASSISTANCE',
            question: 'Que faire en cas de panne pendant ma location ?',
            reponse: 'En cas de panne, contactez immédiatement le concessionnaire dont les coordonnées figurent sur votre contrat de location. La plupart des concessionnaires proposent une assistance dépannage 24h/24. Ne faites pas réparer le véhicule sans accord préalable du concessionnaire.'
        },
        {
            categorie: 'ASSISTANCE',
            question: 'Puis-je modifier mes dates de réservation ?',
            reponse: 'Oui, vous pouvez demander une modification de dates en contactant directement le concessionnaire via la messagerie de la plateforme. La modification est soumise à la disponibilité du véhicule et peut entraîner un ajustement du prix.'
        },
    ];

    // Filtrer les FAQ selon la recherche et la catégorie
    const faqFiltrees = faqData.filter(faq => {
        const matchCategorie = categorieActive === 'TOUT' || faq.categorie === categorieActive;
        const matchRecherche = searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.reponse.toLowerCase().includes(searchQuery.toLowerCase());

        return matchCategorie && matchRecherche;
    });

    const toggleFaq = (index) => {
        setFaqOuverte(faqOuverte === index ? null : index);
    };

    return (
        <DashboardLayout title="Centre d'aide">
            {/* En-tête */}
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiHelpCircle className="w-8 h-8 text-teal-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Comment pouvons-nous vous aider ?
                </h1>
                <p className="text-gray-600">
                    Trouvez rapidement des réponses à vos questions
                </p>
            </div>

            {/* Barre de recherche */}
            <div className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher dans la FAQ..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                    />
                </div>
            </div>

            {/* Catégories */}
            <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((cat) => {
                        const IconeCategorie = cat.icone;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setCategorieActive(cat.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${categorieActive === cat.id
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <IconeCategorie className="w-5 h-5" />
                                <span>{cat.nom}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* FAQ */}
            <div className="max-w-4xl mx-auto mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Questions fréquentes
                    {categorieActive !== 'TOUT' && ` - ${categories.find(c => c.id === categorieActive)?.nom}`}
                </h2>

                {faqFiltrees.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Aucun résultat trouvé
                        </h3>
                        <p className="text-gray-600">
                            Essayez avec d'autres mots-clés ou contactez notre support
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqFiltrees.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                                >
                                    <span className="font-medium text-gray-900 text-left">
                                        {faq.question}
                                    </span>
                                    {faqOuverte === index ? (
                                        <FiChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                                    ) : (
                                        <FiChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                                    )}
                                </button>
                                {faqOuverte === index && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <p className="text-gray-700 leading-relaxed">
                                            {faq.reponse}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contact */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg shadow-xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">
                        Vous n'avez pas trouvé de réponse ?
                    </h2>
                    <p className="mb-6 text-teal-100">
                        Notre équipe est là pour vous aider. Contactez-nous par le moyen qui vous convient le mieux.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="mailto:support@autoconnect.sn"
                            className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <FiMail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium">Email</div>
                                <div className="text-sm text-teal-100">support@autoconnect.sn</div>
                            </div>
                        </a>

                        <a
                            href="tel:+221XXXXXXXX"
                            className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <FiPhone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium">Téléphone</div>
                                <div className="text-sm text-teal-100">+221 33 XXX XX XX</div>
                            </div>
                        </a>

                        <Link
                            to="/client/demandes"
                            className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <FiMessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium">Messagerie</div>
                                <div className="text-sm text-teal-100">Contactez-nous en ligne</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}