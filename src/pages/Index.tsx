import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturedEvents from "@/components/landing/FeaturesSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedEvents />
      <CategoriesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
