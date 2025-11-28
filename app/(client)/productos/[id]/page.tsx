import ProductDetail from "@/app/components/products/ProductDetail";
import ProductSection from "@/app/components/products/ProductSection";
import {
  fetchProductDetailById,
  fetchProductVariationsByProductId,
} from "@/lib/products";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) {
    notFound();
  }

  const [productRows, variations] = await Promise.all([
    fetchProductDetailById(productId),
    fetchProductVariationsByProductId(productId),
  ]);

  const product = productRows?.[0];

  if (!product) {
    notFound();
  }

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
