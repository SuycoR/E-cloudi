import HeroCarousel from "../components/ui/HeroCarousel";
import WelcomeDiscountBanner from "../components/ui/WelcomeDiscountBanner";
import CarruselMarcas from "../components/ui/CarruselMarcas";
import ProductSection from "../components/products/ProductSection";
import FeaturesSection from "../components/ui/FeaturesSection";
import AnimatedSection from "../components/ui/AnimatedSection";

export default function Home() {
  return (
    <main className="bg-white">
      {/* Hero Carousel Section */}
      <AnimatedSection animation="fade-in" delay={0}>
        <section className="container-padding pt-4">
          <HeroCarousel />
        </section>
      </AnimatedSection>

      {/* Welcome Discount Banner */}
      <AnimatedSection animation="fade-up" delay={100}>
        <section className="container-padding pb-8">
          <WelcomeDiscountBanner />
        </section>
      </AnimatedSection>

      {/* Recommended Products Section */}
      <AnimatedSection animation="fade-in" delay={0}>
        <section className="bg-white">
          <ProductSection
            title="Productos recomendados"
            filterType="all"
            limit={12}
            asCarousel={true}
          />
        </section>
      </AnimatedSection>

      {/* Brands Carousel */}
      <AnimatedSection animation="fade-up" delay={0}>
        <CarruselMarcas title="Nuestras Marcas" />
      </AnimatedSection>

      {/* Best Sellers Section */}
      <AnimatedSection animation="fade-in" delay={0}>
        <section className="bg-gray-50">
          <ProductSection
            title="Descubre los productos más vendidos"
            filterType="all"
            limit={12}
            asCarousel={true}
          />
        </section>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection animation="fade-up" delay={0}>
        <FeaturesSection />
      </AnimatedSection>

      {/* Based on Your Searches Section */}
      <AnimatedSection animation="fade-in" delay={0}>
        <section className="bg-white">
          <ProductSection
            title="Basado en tus búsquedas"
            filterType="all"
            limit={8}
            asCarousel={true}
          />
        </section>
      </AnimatedSection>
    </main>
  );
}
