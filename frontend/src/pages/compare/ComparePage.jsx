import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FiAlertCircle,
    FiDownload,
    FiShare2,
    FiPrinter
} from 'react-icons/fi';

// Composants
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CompareCard from '../../components/compare/CompareCard';
import VehicleSelector from '../../components/compare/VehicleSelector';
import ComparisonTable from '../../components/compare/ComparisonTable';

export default function ComparePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [vehicules, setVehicules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const maxVehicles = 4;
    const minVehicles = 2;

    // Charger les véhicules depuis l'URL
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);

                // Récupérer les IDs depuis les query params
                const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

                if (ids.length === 0) {
                    setVehicules([]);
                    setLoading(false);
                    return;
                }

                // Fetch chaque véhicule
                const promises = ids.map(id => axios.get(`/api/vehicules/${id}/`));
                const responses = await Promise.all(promises);
                const fetchedVehicles = responses.map(r => r.data);

                setVehicules(fetchedVehicles);
                setError(null);
            } catch (err) {
                console.error('Erreur lors du chargement des véhicules:', err);
                setError('Impossible de charger certains véhicules.');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [searchParams]);

    // Mettre à jour l'URL quand les véhicules changent
    const updateURL = (newVehicules) => {
        const ids = newVehicules.map(v => v.id).join(',');
        navigate(`/compare?ids=${ids}`, { replace: true });
    };

    // Ajouter un véhicule
    const handleAddVehicle = (vehicule) => {
        if (vehicules.length >= maxVehicles) {
            alert(`Vous ne pouvez comparer que ${maxVehicles} véhicules maximum.`);
            return;
        }

        const newVehicules = [...vehicules, vehicule];
        setVehicules(newVehicules);
        updateURL(newVehicules);
    };

    // Retirer un véhicule
    const handleRemoveVehicle = (vehiculeId) => {
        const newVehicules = vehicules.filter(v => v.id !== vehiculeId);
        setVehicules(newVehicules);
        updateURL(newVehicules);
    };

    // Déterminer le meilleur prix
    const getBestValueIndex = () => {
        if (vehicules.length < 2) return -1;

        let bestIndex = 0;
        let lowestPrice = Infinity;

        vehicules.forEach((v, index) => {
            const price = v.type_offre === 'LOCATION' ? v.prix_location_jour : v.prix_vente;
            if (price && price < lowestPrice) {
                lowestPrice = price;
                bestIndex = index;
            }
        });

        return bestIndex;
    };

    const bestValueIndex = getBestValueIndex();

    // Imprimer la page
    const handlePrint = () => {
        window.print();
    };

    // Partager
    const handleShare = () => {
        const url = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: 'Comparaison de véhicules - AutoConnect',
                url: url,
            }).catch(console.error);
        } else {
            // Copier dans le presse-papier
            navigator.clipboard.writeText(url);
            alert('Lien copié dans le presse-papier !');
        }
    };

    // État de chargement initial
    if (loading && vehicules.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600"></div>
                        <p className="text-xl text-gray-600">Chargement...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-blue-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Comparateur de Véhicules
                        </h1>
                        <p className="text-xl text-teal-50 max-w-3xl mx-auto">
                            Comparez jusqu'à {maxVehicles} véhicules côte à côte pour trouver celui qui correspond le mieux à vos besoins.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Sélecteur de véhicules */}
                <div className="mb-8">
                    <VehicleSelector
                        selectedVehicles={vehicules}
                        onAdd={handleAddVehicle}
                        maxVehicles={maxVehicles}
                    />
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                        <FiAlertCircle className="text-red-600 text-xl flex-shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* État vide */}
                {vehicules.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiAlertCircle className="text-teal-600 text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Aucun véhicule sélectionné
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Utilisez la barre de recherche ci-dessus pour ajouter des véhicules à comparer.
                                Vous pouvez comparer jusqu'à {maxVehicles} véhicules à la fois.
                            </p>
                            <button
                                onClick={() => navigate('/vehicules')}
                                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Parcourir les véhicules
                            </button>
                        </div>
                    </div>
                ) : vehicules.length < minVehicles ? (
                    // Besoin de plus de véhicules
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center mb-8">
                        <FiAlertCircle className="text-yellow-600 text-4xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Ajoutez au moins {minVehicles - vehicules.length} véhicule{minVehicles - vehicules.length > 1 ? 's' : ''} supplémentaire{minVehicles - vehicules.length > 1 ? 's' : ''}
                        </h3>
                        <p className="text-gray-600">
                            Vous devez sélectionner au moins {minVehicles} véhicules pour effectuer une comparaison.
                        </p>
                    </div>
                ) : null}

                {/* Cards des véhicules */}
                {vehicules.length > 0 && (
                    <>
                        {/* Actions */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''} en comparaison
                            </h2>

                            {vehicules.length >= minVehicles && (
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleShare}
                                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
                                    >
                                        <FiShare2 />
                                        <span className="hidden sm:inline">Partager</span>
                                    </button>

                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
                                    >
                                        <FiPrinter />
                                        <span className="hidden sm:inline">Imprimer</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Grille de cards */}
                        <div className={`grid grid-cols-1 ${vehicules.length === 2 ? 'md:grid-cols-2' :
                                vehicules.length === 3 ? 'md:grid-cols-3' :
                                    'md:grid-cols-2 lg:grid-cols-4'
                            } gap-6 mb-12`}>
                            {vehicules.map((vehicule, index) => (
                                <CompareCard
                                    key={vehicule.id}
                                    vehicule={vehicule}
                                    onRemove={() => handleRemoveVehicle(vehicule.id)}
                                    isBestValue={index === bestValueIndex}
                                />
                            ))}
                        </div>

                        {/* Tableau de comparaison */}
                        {vehicules.length >= minVehicles && (
                            <ComparisonTable vehicules={vehicules} />
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}