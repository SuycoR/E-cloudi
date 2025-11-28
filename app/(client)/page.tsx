import CarruselPromociones from "../components/ui/CarruselPromociones";
import ProductSection from "../components/products/ProductSection";
import CarruselMarcas from "../components/ui/CarruselMarcas";
export default function Home() {
  return (
    <main className="bg-ebony-50">
      <CarruselPromociones />
      <ProductSection
        title="¡Promoción por invierno!"
        filterType="byPromotion"
        promotionId={21}
        asCarousel={true}
      />
      <ProductSection
        title="¡Promocion por Julio!"
        filterType="byPromotion"
        promotionId={20}
        asCarousel={true}
      />
      <ProductSection
        title="¡Conoce algunos de nuestros productos!"
        filterType="all"
        limit={21}
        asCarousel={true}
      />
      <CarruselMarcas />
    </main>
  );
}

