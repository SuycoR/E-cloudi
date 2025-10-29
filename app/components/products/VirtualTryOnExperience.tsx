"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UploadCloud, Sparkles, Loader2, ImageIcon } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import type { ProductDetailProps } from "@/app/types/props";
import type { CartItem } from "@/app/types/itemCarrito";
import { sendGAEvent } from "@next/third-parties/google";

interface VirtualTryOnExperienceProps {
  product: ProductDetailProps;
}

interface ResultImage {
  id: string;
  label: string;
  url: string;
}

const BASE_GALLERY: ResultImage[] = [
  {
    id: "front",
    label: "Frontal",
    url: "https://images.unsplash.com/photo-1614699745279-2c61bd9d46b5",
  },
  {
    id: "side",
    label: "Costado",
    url: "https://i0.wp.com/www.theclothesmaiden.com/wp-content/uploads/2024/01/brock-wegner-VYuV0yZc5eI-unsplash-scaled.jpg?fit=2048,2560&ssl=1",
  },
  {
    id: "back",
    label: "Espalda",
    url: "https://www.ditur.com/media/catalog/category/beanies_1.jpg",
  },
];

const FALLBACK_IMAGE =
  "https://img.freepik.com/vector-gratis/ilustracion-icono-doodle-engranaje_53876-5596.jpg?semt=ais_hybrid&w=740";

const VirtualTryOnExperience: React.FC<VirtualTryOnExperienceProps> = ({
  product,
}) => {
  const { addItem } = useCart();
  const [results, setResults] = useState<ResultImage[]>(BASE_GALLERY);
  const [selectedResult, setSelectedResult] = useState<ResultImage>(
    BASE_GALLERY[0]
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const basePrice = useMemo(() => {
    const priceNumber = Number(product.precio ?? 0);
    return Number.isFinite(priceNumber) ? priceNumber : 0;
  }, [product.precio]);

  const finalPrice = useMemo(() => {
    if (product.descuento != null) {
      const discount = Number(product.descuento);
      const multiplier = Number.isFinite(discount) ? 1 - discount : 1;
      const computed = basePrice * multiplier;
      return Number.isFinite(computed)
        ? Number(computed.toFixed(2))
        : basePrice;
    }
    return basePrice;
  }, [basePrice, product.descuento]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const step = Math.random() * 12;
        const next = prev + step;
        return next >= 95 ? 95 : next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (isGenerating || progress === 0) return;
    if (progress < 100) {
      setProgress(100);
    }
    const timeout = setTimeout(() => setProgress(0), 600);
    return () => clearTimeout(timeout);
  }, [isGenerating, progress]);

  useEffect(() => {
    return () => {
      if (uploadedPreview) URL.revokeObjectURL(uploadedPreview);
    };
  }, [uploadedPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadedFile(file);
    if (uploadedPreview) {
      URL.revokeObjectURL(uploadedPreview);
    }
    if (file) {
      const preview = URL.createObjectURL(file);
      setUploadedPreview(preview);
      setStatusMessage("Listo, genera tu try-on cuando quieras.");
    } else {
      setUploadedPreview(null);
    }
  };

  const simulateNanobananaCall = async () => {
    // TODO: Reemplazar esta simulación con la integración real hacia Nanobanana.
    await new Promise((resolve) => setTimeout(resolve, 2600));
    return BASE_GALLERY;
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      setStatusMessage("Primero sube una foto para que podamos analizarla.");
      return;
    }
    setIsGenerating(true);
    setStatusMessage("Analizando tu foto y aplicando la prenda...");
    try {
      const generated = await simulateNanobananaCall();
      setResults(generated);
      setSelectedResult(generated[0]);
      setStatusMessage("¡Listo! Explora los diferentes ángulos generados.");
    } catch (error) {
      console.error("Virtual try-on error:", error);
      setStatusMessage("No pudimos generar el try-on. Inténtalo nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectResult = (image: ResultImage) => {
    setSelectedResult(image);
  };

  const handleAddToCart = async () => {
    if (!product.id_producto_especifico) return;
    const item: CartItem = {
      productId: product.id_producto_especifico,
      nombre: product.nombre,
      descripcion: product.descripcion || "",
      image_producto: product.imagen_producto || "",
      cantidad: 1,
      precio: finalPrice,
    };

    try {
      await addItem(item);
      sendGAEvent("event", "add_to_cart", {
        item_id: product.id_producto_especifico,
        item_name: product.nombre,
        category: "Productos",
        price: finalPrice,
        quantity: 1,
      });
      setStatusMessage("Producto añadido al carrito correctamente.");
    } catch (error) {
      console.error("Error al agregar al carrito desde virtual try-on:", error);
      setStatusMessage("No pudimos añadir el producto al carrito.");
    }
  };

  const showProgressBar = isGenerating || progress > 0;

  return (
    <section className="space-y-10 py-10">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">
          StyleHub Virtual Try-On
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Virtual Try On</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600">
          Sube tu foto y deja que nuestra integración con Nanobanana adapte
          <span className="font-semibold text-slate-900">
            {" "}
            {product.nombre}
          </span>{" "}
          a tu estilo. Generaremos vistas adicionales para que lo veas en
          diferentes ángulos.
        </p>
      </header>

      {showProgressBar && (
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-sky-500 transition-all duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs font-medium text-slate-500 text-center">
            {isGenerating ? "Generando resultados con IA..." : statusMessage}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <img
            src={selectedResult?.url || FALLBACK_IMAGE}
            alt={`Vista ${selectedResult?.label ?? "generada"}`}
            className="h-full w-full object-cover"
          />
          <label
            htmlFor="virtual-try-on-upload"
            className="group absolute bottom-4 left-4 flex cursor-pointer items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-black/80"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Photo
            <input
              id="virtual-try-on-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {uploadedPreview && !isGenerating && (
            <span className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow">
              {uploadedFile?.name}
            </span>
          )}
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 backdrop-blur-sm">
              <Loader2 className="h-9 w-9 animate-spin text-white" />
              <p className="text-sm font-medium text-white">
                Ajustando la prenda a tu foto...
              </p>
            </div>
          )}
        </div>

        <aside className="w-full max-w-xs space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Explora más fotos
            </h2>
            <div className="grid gap-3">
              {results.map((image) => {
                const isActive = image.id === selectedResult?.id;
                return (
                  <button
                    type="button"
                    key={image.id}
                    onClick={() => handleSelectResult(image)}
                    className={`relative overflow-hidden rounded-2xl border ${
                      isActive
                        ? "border-sky-500 ring-2 ring-sky-200"
                        : "border-slate-200"
                    } bg-white shadow-sm transition hover:shadow-md`}
                  >
                    <img
                      src={image.url}
                      alt={`Vista ${image.label}`}
                      className="h-28 w-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                      {image.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-sky-600" />
              <p className="text-sm font-semibold text-slate-900">
                {uploadedFile ? "Foto lista" : "Sube una foto"}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {uploadedFile
                ? "Cuando estés listo, genera tu fitting virtual."
                : "Sube una foto frontal para obtener el mejor resultado."}
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-4 w-full rounded-full bg-sky-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generando..." : "Generar look con IA"}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              {product.nombre}
            </p>
            <p className="text-xs text-slate-500">SKU: {product.SKU}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">
                S/ {finalPrice.toFixed(2)}
              </span>
              {product.descuento != null && (
                <span className="text-xs text-slate-400 line-through">
                  S/ {basePrice.toFixed(2)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-4 w-full rounded-full bg-ebony-800 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ebony-900"
            >
              Añadir al carrito
            </button>
            <Link
              href={`/productos/${product.id_producto_especifico}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Volver al producto
            </Link>
          </div>

          {statusMessage && !showProgressBar && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500 shadow-sm">
              {statusMessage}
            </div>
          )}
        </aside>
      </div>

      {uploadedPreview && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ImageIcon className="h-4 w-4 text-sky-600" />
            Vista previa de tu foto
          </h3>
          <img
            src={uploadedPreview}
            alt="Foto subida por el usuario"
            className="h-64 w-full rounded-2xl object-cover"
          />
        </div>
      )}
    </section>
  );
};

export default VirtualTryOnExperience;
