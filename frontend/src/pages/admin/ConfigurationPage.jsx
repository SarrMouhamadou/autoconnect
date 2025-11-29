import { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import adminService from '../../services/adminService';

function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState('regions');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // États pour chaque type de configuration
    const [regions, setRegions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [marques, setMarques] = useState([]);

    // États pour les formulaires d'ajout
    const [newRegion, setNewRegion] = useState('');
    const [newCategorie, setNewCategorie] = useState('');
    const [newMarque, setNewMarque] = useState('');

    useEffect(() => {
        loadConfigurations();
    }, []);

    const loadConfigurations = async () => {
        try {
            setLoading(true);
            const [regionsData, categoriesData, marquesData] = await Promise.all([
                adminService.getAllRegions().catch(() => []),
                adminService.getAllCategories().catch(() => []),
                adminService.getAllMarques().catch(() => [])
            ]);

            setRegions(Array.isArray(regionsData) ? regionsData : regionsData.results || []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.results || []);
            setMarques(Array.isArray(marquesData) ? marquesData : marquesData.results || []);
        } catch (error) {
            console.error('Erreur chargement configurations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRegion = async () => {
        if (!newRegion.trim()) return;

        try {
            setSaving(true);
            await adminService.creerRegion({ nom: newRegion });
            setNewRegion('');
            loadConfigurations();
            alert('✅ Région ajoutée');
        } catch (error) {
            alert('❌ Erreur');
        } finally {
            setSaving(false);
        }
    };

    const handleAddCategorie = async () => {
        if (!newCategorie.trim()) return;

        try {
            setSaving(true);
            await adminService.creerCategorie({ nom: newCategorie });
            setNewCategorie('');
            loadConfigurations();
            alert('✅ Catégorie ajoutée');
        } catch (error) {
            alert('❌ Erreur');
        } finally {
            setSaving(false);
        }
    };

    const handleAddMarque = async () => {
        if (!newMarque.trim()) return;

        try {
            setSaving(true);
            await adminService.creerMarque({ nom: newMarque });
            setNewMarque('');
            loadConfigurations();
            alert('✅ Marque ajoutée');
        } catch (error) {
            alert('❌ Erreur');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRegion = async (id) => {
        if (!confirm('Supprimer cette région ?')) return;

        try {
            await adminService.supprimerRegion(region.id);
            loadConfigurations();
            alert('✅ Région supprimée');
        } catch (error) {
            alert('❌ Erreur : cette région est peut-être utilisée');
        }
    };

    const handleDeleteCategorie = async (id) => {
        if (!confirm('Supprimer cette catégorie ?')) return;

        try {
            await adminService.supprimerCategorie(categorie.id);
            loadConfigurations();
            alert('✅ Catégorie supprimée');
        } catch (error) {
            alert('❌ Erreur : cette catégorie est peut-être utilisée');
        }
    };

    const handleDeleteMarque = async (id) => {
        if (!confirm('Supprimer cette marque ?')) return;

        try {
            await adminService.supprimerMarque(marque.id);
            loadConfigurations();
            alert('✅ Marque supprimée');
        } catch (error) {
            alert('❌ Erreur : cette marque est peut-être utilisée');
        }
    };

    return (
        <DashboardLayout title="Configuration">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Configuration de la plateforme</h1>
                <p className="text-gray-600 mt-2">Gérer les régions, catégories et marques</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('regions')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'regions'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Régions ({regions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'categories'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Catégories ({categories.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('marques')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'marques'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Marques ({marques.length})
                        </button>
                    </nav>
                </div>
            </div>

            {/* Contenu selon l'onglet actif */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* RÉGIONS */}
                        {activeTab === 'regions' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion des régions</h2>

                                {/* Formulaire ajout */}
                                <div className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        value={newRegion}
                                        onChange={(e) => setNewRegion(e.target.value)}
                                        placeholder="Nouvelle région (ex: Dakar)"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddRegion()}
                                    />
                                    <button
                                        onClick={handleAddRegion}
                                        disabled={!newRegion.trim() || saving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <FiPlus /> Ajouter
                                    </button>
                                </div>

                                {/* Liste */}
                                <div className="space-y-2">
                                    {regions.map((region) => (
                                        <div
                                            key={region.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            <span className="font-medium text-gray-900">{region.nom}</span>
                                            <button
                                                onClick={() => handleDeleteRegion(region.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                    {regions.length === 0 && (
                                        <p className="text-gray-500 text-center py-8">Aucune région configurée</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CATÉGORIES */}
                        {activeTab === 'categories' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion des catégories</h2>

                                {/* Formulaire ajout */}
                                <div className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        value={newCategorie}
                                        onChange={(e) => setNewCategorie(e.target.value)}
                                        placeholder="Nouvelle catégorie (ex: SUV)"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategorie()}
                                    />
                                    <button
                                        onClick={handleAddCategorie}
                                        disabled={!newCategorie.trim() || saving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <FiPlus /> Ajouter
                                    </button>
                                </div>

                                {/* Liste */}
                                <div className="space-y-2">
                                    {categories.map((categorie) => (
                                        <div
                                            key={categorie.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            <span className="font-medium text-gray-900">{categorie.nom}</span>
                                            <button
                                                onClick={() => handleDeleteCategorie(categorie.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                    {categories.length === 0 && (
                                        <p className="text-gray-500 text-center py-8">Aucune catégorie configurée</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MARQUES */}
                        {activeTab === 'marques' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion des marques</h2>

                                {/* Formulaire ajout */}
                                <div className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        value={newMarque}
                                        onChange={(e) => setNewMarque(e.target.value)}
                                        placeholder="Nouvelle marque (ex: Toyota)"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddMarque()}
                                    />
                                    <button
                                        onClick={handleAddMarque}
                                        disabled={!newMarque.trim() || saving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <FiPlus /> Ajouter
                                    </button>
                                </div>

                                {/* Liste */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {marques.map((marque) => (
                                        <div
                                            key={marque.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            <span className="font-medium text-gray-900">{marque.nom}</span>
                                            <button
                                                onClick={() => handleDeleteMarque(marque.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                    {marques.length === 0 && (
                                        <p className="text-gray-500 text-center py-8 col-span-3">Aucune marque configurée</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default ConfigurationPage;