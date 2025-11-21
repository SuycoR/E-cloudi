import CarruselPromociones from "../components/ui/CarruselPromociones";
import ProductSection from "../components/products/ProductSection";
import CarruselMarcas from "../components/ui/CarruselMarcas";
export default function Home() {
  return (
    <main className="bg-ebony-50">
      {/* Top hero carousel */}
      <CarruselPromociones />

      {/* Centered promo banner with CTA */}
      <section className="py-10">
        <div className="container-padding mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold">Descuento Bienvenida</h2>
            <p className="mt-2 text-sm text-slate-600">
              Especial para nuevos compradores
            </p>
            <div className="mt-4">
              <button className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-white font-semibold hover:bg-sky-700 transition">
                Comprar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories row (placeholders) */}
      <section className="py-8">
        <div className="container-padding">
          <h3 className="text-lg font-semibold mb-4">Compra por Categoría</h3>
          <div className="flex items-center gap-4">
            <button className="rounded-full w-8 h-8 bg-white shadow">◀</button>
            <div className="grid grid-cols-4 gap-4 flex-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-ebony-50 rounded-lg flex items-center justify-center border border-white/20"
                >
                  <div className="w-20 h-14 bg-white/50 rounded" />
                </div>
              ))}
            </div>
            <button className="rounded-full w-8 h-8 bg-white shadow">▶</button>
          </div>
        </div>
      </section>

      {/* Brands banner */}
      <section className="py-4">
        <div className="container-padding">
          <CarruselMarcas />
        </div>
      </section>

      {/* Recommended products */}
      <section className="py-10">
        <div className="container-padding">
          <ProductSection
            title="Productos recomendados"
            filterType="bestSellers"
            limit={6}
            asCarousel={true}
          />
        </div>
      </section>

      {/* Best sellers grid */}
      <section className="py-8">
        <div className="container-padding">
          <h3 className="text-lg font-semibold mb-4">
            Descubre los productos más vendidos
          </h3>
          <ProductSection
            title="Más vendidos"
            filterType="bestSellers"
            limit={6}
            asCarousel={false}
          />
        </div>
      </section>

      {/* Features row */}
      <section className="py-12">
        <div className="container-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl">🚚</div>
              <p className="mt-2 font-semibold">Envío rápido</p>
              <p className="text-xs text-slate-500">Entrega en 24h</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl">🔒</div>
              <p className="mt-2 font-semibold">Pago seguro</p>
              <p className="text-xs text-slate-500">Transacciones protegidas</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl">🔄</div>
              <p className="mt-2 font-semibold">Devoluciones</p>
              <p className="text-xs text-slate-500">Fáciles y rápidas</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl">⭐</div>
              <p className="mt-2 font-semibold">Soporte 24/7</p>
              <p className="text-xs text-slate-500">Estamos para ayudarte</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
