import {
  Navbar,
  HeroSection,
  FeaturedEvents,
  CategoriesSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <HeroSection />
        <FeaturedEvents />
        <CategoriesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
