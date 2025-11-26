import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

// Composants
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ConcessionHero from '../../components/concessions/ConcessionHero';
import ConcessionGallery from '../../components/concessions/ConcessionGallery';
import ConcessionInfo from '../../components/concessions/ConcessionInfo';
import ConcessionMap from '../../components/concessions/ConcessionMap';
import ConcessionSidebar from '../../components/concessions/ConcessionSidebar';
import ContactForm from '../../components/forms/ContactForm';
import ConcessionNewCars from '../../components/concessions/ConcessionNewCars';
import ConcessionVehicules from '../../components/concessions/ConcessionVehicules';
import ConcessionReviews from '../../components/concessions/ConcessionReviews';

export default function ConcessionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [concession, setConcession] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les données de la concession
    useEffect(() => {
        const fetchConcession = async () => {
            try {
                setLoading(true);

                // Fetch concession details
                const response = await axios.get(`/api/concessions/${id}/`);
                setConcession(response.data);

                // Fetch photos des véhicules de la concession
                const photosResponse = await axios.get('/api/vehicules/', {
                    params: {
                        concession: id,
                        page_size: 100, // Limite raisonnable
                    },
                });

                // Extraire toutes les photos de tous les véhicules
                const vehicules = photosResponse.data.results || photosResponse.data;
                const allPhotos = vehicules.flatMap(vehicule =>
                    vehicule.photos?.map(photo => ({
                        ...photo,
                        vehicule: vehicule.nom_complet,
                    })) || []
                );

                setPhotos(allPhotos);
                setError(null);
            } catch (err) {
                console.error('Erreur lors du chargement de la concession:', err);
                setError(
                    err.response?.status === 404
                        ? 'Concession non trouvée.'
                        : 'Une erreur est survenue lors du chargement de la concession.'
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchConcession();
        }
    }, [id]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // État de chargement
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600"></div>
                        <p className="text-xl text-gray-600">Chargement de la concession...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <FiAlertCircle className="mx-auto text-6xl text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/concessions')}
                            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Retour aux concessions
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Concession non trouvée
    if (!concession) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Concession non trouvée
                        </h2>
                        <p className="text-gray-600 mb-6">
                            La concession que vous recherchez n'existe pas ou a été supprimée.
                        </p>
                        <button
                            onClick={() => navigate('/concessions')}
                            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Retour aux concessions
                        </button>
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
            <ConcessionHero concession={concession} />

            {/* Contenu principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Bouton retour */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <FiArrowLeft />
                    <span>Retour</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne principale (70%) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Galerie Photos */}
                        <ConcessionGallery photos={photos} />

                        {/* À propos + Services */}
                        <ConcessionInfo concession={concession} />

                        {/* Carte Leaflet (version mobile/tablet) */}
                        <div className="lg:hidden">
                            <ConcessionMap
                                latitude={concession.latitude}
                                longitude={concession.longitude}
                                concessionName={concession.nom_entreprise}
                                address={concession.adresse}
                                telephone={concession.telephone_entreprise}
                                email={concession.email}
                            />
                        </div>
                    </div>

                    {/* Sidebar droite (30%) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-6">
                            {/* Carte (desktop only) */}
                            <div className="hidden lg:block">
                                <ConcessionMap
                                    latitude={concession.latitude}
                                    longitude={concession.longitude}
                                    concessionName={concession.nom_entreprise}
                                    address={concession.adresse}
                                    telephone={concession.telephone_entreprise}
                                    email={concession.email}
                                />
                            </div>

                            {/* Sidebar */}
                            <ConcessionSidebar concession={concession} />
                        </div>
                    </div>
                </div>

                {/* Formulaire de contact */}
                <div id="contact-section" className="mt-12">
                    <ContactForm
                        concessionId={concession.id}
                        concessionName={concession.nom_entreprise}
                    />
                </div>

                {/* Section Derniers ajouts */}
                <div className="mt-12">
                    <ConcessionNewCars concessionId={concession.id} />
                </div>

                {/* Section Tous les véhicules */}
                <div className="mt-12">
                    <ConcessionVehicules concessionId={concession.id} />
                </div>

                {/* Section Avis clients */}
                <div className="mt-12">
                    <ConcessionReviews concessionId={concession.id} />
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}