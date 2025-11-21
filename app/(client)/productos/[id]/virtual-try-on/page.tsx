import Link from "next/link";
import VirtualTryOnExperience from "@/app/components/products/VirtualTryOnExperience";
import type { ProductDetailProps } from "@/app/types/props";

async function getProduct(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/productos/${id}`, {
    // cache for 60s to improve perceived navigation performance (ISR)
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Error al obtener el producto");
  const data = await res.json();
  return data as ProductDetailProps[];
}

export default async function VirtualTryOnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: ProductDetailProps | null = null;

  try {
    const data = await getProduct(id);
    product = data?.[0] ?? null;
  } catch (error) {
    console.error("Virtual try-on product fetch error:", error);
  }

  if (!product) {
    return (
      <main className="container-padding py-16">
        <section className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
          <h1 className="text-2xl font-semibold">
            No encontramos este producto
          </h1>
          <p className="text-sm">
            No pudimos cargar la información necesaria para el virtual try-on.
            Intenta volver a la página del producto.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="container-padding py-10">
      <VirtualTryOnExperience product={product} />
    </main>
  );
}
