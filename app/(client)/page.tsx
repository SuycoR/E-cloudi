import HeroCarousel from "../components/ui/HeroCarousel";
import WelcomeDiscountBanner from "../components/ui/WelcomeDiscountBanner";
import CategoryCards from "../components/ui/CategoryCards";
import CarruselMarcas from "../components/ui/CarruselMarcas";
import ProductSection from "../components/products/ProductSection";
import FeaturesSection from "../components/ui/FeaturesSection";

export default function Home() {
  return (
    <main className="bg-white">
      {/* Hero Carousel Section */}
      <section className="container-padding pt-4">
        <HeroCarousel />
      </section>

      {/* Welcome Discount Banner */}
      <section className="container-padding pb-8">
        <WelcomeDiscountBanner />
      </section>

      {/* Recommended Products Section */}
      <section className="bg-white">
        <ProductSection
          title="Productos recomendados"
          filterType="all"
          limit={12}
          asCarousel={true}
        />
      </section>

      {/* Brands Carousel */}
      <CarruselMarcas title="Nuestras Marcas" />

      {/* Best Sellers Section */}
      <section className="bg-gray-50">
        <ProductSection
          title="Descubre los productos más vendidos"
          filterType="all"
          limit={12}
          asCarousel={true}
        />
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Based on Your Searches Section */}
      <section className="bg-white">
        <ProductSection
          title="Basado en tus búsquedas"
          filterType="all"
          limit={8}
          asCarousel={true}
        />
      </section>

      {/* Promotions Section */}
      <section className="bg-gray-50">
        <ProductSection
          title="Ofertas Especiales"
          filterType="onlyPromotions"
          limit={12}
          asCarousel={true}
        />
      </section>
    </main>
  );
}
