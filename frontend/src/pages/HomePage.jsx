import HeroSection from '../components/home/HeroSection';
import BrowseByCategory from '../components/home/BrowseByCategory';
import PopularVehicles from '../components/home/PopularVehicles';
import VehiculesLocation from '../components/home/VehiculesLocation';
import VehiculesVente from '../components/home/VehiculesVente';
import ConcessionsNearYou from '../components/home/ConcessionsNearYou';
import HowItWorks from '../components/home/HowItWorks';
import ServicesSection from '../components/home/ServicesSection';
import BrandLogos from '../components/home/BrandLogos';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';


export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Section Hero avec recherche */}
      <Navbar />

      {/* Section Hero avec recherche */}
      <HeroSection />

      {/* Section Parcourir par catégorie */}
      <BrowseByCategory />

      {/* Section Véhicules les plus recherchés/vus */}
      <PopularVehicles />

      {/* Section Véhicules en location */}
      <VehiculesLocation />

      {/* Section Véhicules en vente */}
      <VehiculesVente />

      {/* Section Concessions proches */}
      <ConcessionsNearYou />

      {/* Section Comment ça marche */}
      <HowItWorks />

      {/* Section Services et avantages */}
      <ServicesSection />

      {/* Section Logos des marques */}
      <BrandLogos />

      {/* Section Footer */}
      <Footer />
    </div>
  );
}