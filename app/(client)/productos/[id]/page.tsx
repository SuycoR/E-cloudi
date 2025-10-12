import ProductDetail from "@/app/components/products/ProductDetail";
import ProductSection from "@/app/components/products/ProductSection";
async function getProduct(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/productos/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener el producto");
  const data = await res.json();
  return data;
}

async function getVariations(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/productos/variaciones/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener las variaciones del producto");
  const variations = await res.json();
  return variations;
}
export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const data = await getProduct(id);
  const variations = await getVariations(id);
  const product = data[0];

  return (
    <>
      
      <ProductDetail {...product} variations={variations} />
     
      <ProductSection
        title="Otros productos en la misma categoria"
        filterType="bestSellers"
        limit={2}
        asCarousel={true}
      />
    </>
  );
}
