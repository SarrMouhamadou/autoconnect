import { useState } from 'react';
import { FiSend, FiMail, FiUsers, FiBell } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';

function CommunicationPage() {
    const [activeTab, setActiveTab] = useState('newsletter');
    const [loading, setLoading] = useState(false);

    // États pour newsletter
    const [newsletterData, setNewsletterData] = useState({
        destinataires: 'tous', // tous, clients, concessionnaires
        sujet: '',
        message: ''
    });

    // États pour annonce
    const [annonceData, setAnnonceData] = useState({
        titre: '',
        message: '',
        type: 'INFO', // INFO, URGENT, MAINTENANCE
        destinataires: 'tous'
    });

    const handleSendNewsletter = async (e) => {
        e.preventDefault();

        if (!newsletterData.sujet || !newsletterData.message) {
            alert('⚠️ Veuillez remplir tous les champs');
            return;
        }

        if (!confirm(`Envoyer cette newsletter à ${newsletterData.destinataires} ?`)) return;

        try {
            setLoading(true);
            await adminService.envoyerNewsletter(newsletterData);
            alert('✅ Newsletter envoyée avec succès');
            setNewsletterData({ destinataires: 'tous', sujet: '', message: '' });
        } catch (error) {
            alert('❌ Erreur lors de l\'envoi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublierAnnonce = async (e) => {
        e.preventDefault();

        if (!annonceData.titre || !annonceData.message) {
            alert('⚠️ Veuillez remplir tous les champs');
            return;
        }

        if (!confirm('Publier cette annonce ?')) return;

        try {
            setLoading(true);
            await adminService.publierAnnonce(annonceData);
            alert('✅ Annonce publiée avec succès');
            setAnnonceData({ titre: '', message: '', type: 'INFO', destinataires: 'tous' });
        } catch (error) {
            alert('❌ Erreur lors de la publication');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Communication">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Communication</h1>
                <p className="text-gray-600 mt-2">Envoyer des newsletters et publier des annonces</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('newsletter')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'newsletter'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FiMail /> Newsletter
                        </button>
                        <button
                            onClick={() => setActiveTab('annonce')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'annonce'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FiBell /> Annonces
                        </button>
                    </nav>
                </div>
            </div>

            {/* Contenu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* NEWSLETTER */}
                {activeTab === 'newsletter' && (
                    <form onSubmit={handleSendNewsletter}>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Envoyer une newsletter</h2>

                        <div className="space-y-6">
                            {/* Destinataires */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Destinataires *
                                </label>
                                <select
                                    value={newsletterData.destinataires}
                                    onChange={(e) => setNewsletterData({ ...newsletterData, destinataires: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="tous">Tous les utilisateurs</option>
                                    <option value="clients">Clients uniquement</option>
                                    <option value="concessionnaires">Concessionnaires uniquement</option>
                                </select>
                            </div>

                            {/* Sujet */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sujet *
                                </label>
                                <input
                                    type="text"
                                    value={newsletterData.sujet}
                                    onChange={(e) => setNewsletterData({ ...newsletterData, sujet: e.target.value })}
                                    placeholder="Ex: Nouvelles fonctionnalités disponibles"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    value={newsletterData.message}
                                    onChange={(e) => setNewsletterData({ ...newsletterData, message: e.target.value })}
                                    rows={10}
                                    placeholder="Rédigez votre newsletter..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    {newsletterData.message.length} caractères
                                </p>
                            </div>

                            {/* Aperçu */}
                            {newsletterData.message && (
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                                    <div className="prose prose-sm max-w-none">
                                        {newsletterData.message.split('\n').map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bouton */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                            >
                                <FiSend />
                                {loading ? 'Envoi en cours...' : 'Envoyer la newsletter'}
                            </button>
                        </div>
                    </form>
                )}

                {/* ANNONCE */}
                {activeTab === 'annonce' && (
                    <form onSubmit={handlePublierAnnonce}>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Publier une annonce</h2>

                        <div className="space-y-6">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type d'annonce *
                                </label>
                                <select
                                    value={annonceData.type}
                                    onChange={(e) => setAnnonceData({ ...annonceData, type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="INFO">Information</option>
                                    <option value="URGENT">Urgent</option>
                                    <option value="MAINTENANCE">Maintenance planifiée</option>
                                </select>
                            </div>

                            {/* Destinataires */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Destinataires *
                                </label>
                                <select
                                    value={annonceData.destinataires}
                                    onChange={(e) => setAnnonceData({ ...annonceData, destinataires: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="tous">Tous les utilisateurs</option>
                                    <option value="clients">Clients uniquement</option>
                                    <option value="concessionnaires">Concessionnaires uniquement</option>
                                </select>
                            </div>

                            {/* Titre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    value={annonceData.titre}
                                    onChange={(e) => setAnnonceData({ ...annonceData, titre: e.target.value })}
                                    placeholder="Ex: Maintenance planifiée ce week-end"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    value={annonceData.message}
                                    onChange={(e) => setAnnonceData({ ...annonceData, message: e.target.value })}
                                    rows={6}
                                    placeholder="Détails de l'annonce..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Aperçu */}
                            {annonceData.titre && annonceData.message && (
                                <div className={`border rounded-lg p-4 ${annonceData.type === 'INFO' ? 'border-blue-200 bg-blue-50' :
                                        annonceData.type === 'URGENT' ? 'border-red-200 bg-red-50' :
                                            'border-amber-200 bg-amber-50'
                                    }`}>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Aperçu de l'annonce :</p>
                                    <h3 className={`font-semibold mb-2 ${annonceData.type === 'INFO' ? 'text-blue-900' :
                                            annonceData.type === 'URGENT' ? 'text-red-900' :
                                                'text-amber-900'
                                        }`}>
                                        {annonceData.type === 'URGENT' && '⚠️ '}
                                        {annonceData.type === 'MAINTENANCE' && '🔧 '}
                                        {annonceData.titre}
                                    </h3>
                                    <p className={`text-sm ${annonceData.type === 'INFO' ? 'text-blue-800' :
                                            annonceData.type === 'URGENT' ? 'text-red-800' :
                                                'text-amber-800'
                                        }`}>
                                        {annonceData.message}
                                    </p>
                                </div>
                            )}

                            {/* Bouton */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                            >
                                <FiBell />
                                {loading ? 'Publication...' : 'Publier l\'annonce'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
}

export default CommunicationPage;