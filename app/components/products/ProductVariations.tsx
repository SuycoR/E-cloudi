// /app/components/products/ProductVariations.tsx
"use client";
import React from "react";
import Link from "next/link";

/**
 * Color swatch mapping: maps color names (case-insensitive) to hex codes.
 * Add or adjust as needed for your catalog.
 */
const COLOR_MAP: Record<string, string> = {
  rojo: "#E53935",
  azul: "#1E88E5",
  verde: "#43A047",
  negro: "#222",
  blanco: "#fff",
  gris: "#BDBDBD",
  amarillo: "#FDD835",
  naranja: "#FB8C00",
  morado: "#8E24AA",
  marrón: "#8D6E63",
  rosa: "#EC407A",
  celeste: "#4FC3F7",
  lila: "#BA68C8",
  dorado: "#FFD700",
  plateado: "#B0BEC5",
  // ...agrega más según catálogo
};

export interface ProductVariationItem {
  id_producto_especifico: number;
  especificaciones: {
    color?: string | null;
    [key: string]: any;
  };
}

export interface ProductVariationsProps {
  variations: ProductVariationItem[];
  selectedId: number | null; // id del producto actual
}

/**
 * Muestra una fila de variaciones de color como swatches seleccionables.
 * @param variations Array de opciones de variación (ProductVariationItem[])
 * @param selectedId id_producto_especifico seleccionado
 */
const ProductVariations: React.FC<ProductVariationsProps> = ({
  variations,
  selectedId,
}) => {
  const [currentId, setCurrentId] = React.useState<number | null>(selectedId);

  React.useEffect(() => {
    setCurrentId(selectedId);
  }, [selectedId]);

  return (
    <div
      className="flex flex-row gap-3 my-4"
      role="radiogroup"
      aria-label="Variaciones de color"
    >
      {variations.map((v) => {
        const colorKey = (v.especificaciones.color || "").trim().toLowerCase();
        if (!colorKey) {
          return null;
        }
        const color = COLOR_MAP[colorKey] || "#eee";
        const selected = currentId === v.id_producto_especifico;
        return (
          <Link
            key={v.id_producto_especifico}
            href={`/productos/${v.id_producto_especifico}`}
            aria-label={v.especificaciones.color || undefined}
            scroll={true}
            prefetch={true}
            className="flex flex-col items-center cursor-pointer focus:outline-none group"
            style={{ minWidth: 48 }}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                selected
                  ? "border-2 border-blue-600 shadow-lg"
                  : "border-gray-300 hover:border-blue-400"
              } bg-white`}
            >
              <span
                className="block rounded-full border"
                style={{
                  width: 28,
                  height: 28,
                  background: color,
                  borderColor: selected ? "#2563eb" : "#e5e7eb",
                  borderWidth: 2,
                  display: "inline-block",
                }}
                aria-label={v.especificaciones.color || undefined}
              />
            </div>
            <span className="text-xs mt-1 text-gray-700 capitalize select-none">
              {v.especificaciones.color}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductVariations;
