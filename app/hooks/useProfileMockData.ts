"use client";

import { useEffect, useMemo, useState } from "react";

export interface ProfileMockProduct {
  productoId: number;
  especificoId: number;
  nombre: string;
  imagen: string;
  precio: number;
  descuento?: number | null;
}

export interface ProfileMockEntry {
  producto: ProfileMockProduct;
  estado: string;
  fecha: string;
  codigo: string;
  accionLabel: string;
  accionHref: string;
}

export interface ProfileMockDataset {
  highlights: ProfileMockProduct[];
  pedidos: ProfileMockEntry[];
  devoluciones: ProfileMockEntry[];
  cambios: ProfileMockEntry[];
  updatedAt: number;
}

const STORAGE_KEY = "stylehub-profile-dataset";
const MAX_AGE_MS = 1000 * 60 * 60 * 6; // 6 horas

interface UseProfileMockDataOptions {
  initialize?: boolean;
}

type ApiProduct = {
  producto_id?: number;
  id_producto_especifico?: number;
  nombre?: string;
  imagen_producto?: string;
  precio?: number;
  porcentaje_desc?: number | null;
};

const FALLBACK_PRODUCTS: ProfileMockProduct[] = [
  {
    productoId: 9001,
    especificoId: 900101,
    nombre: "Blazer minimalista tono arena",
    imagen:
      "https://images.unsplash.com/photo-1525171254930-643fc658b64e?auto=format&fit=crop&w=640&q=80",
    precio: 249.9,
    descuento: null,
  },
  {
    productoId: 9002,
    especificoId: 900102,
    nombre: "Camisa clásica azul noche",
    imagen:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80",
    precio: 179.9,
    descuento: 10,
  },
  {
    productoId: 9003,
    especificoId: 900103,
    nombre: "Pantalón tailored grafito",
    imagen:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=640&q=80",
    precio: 229.9,
    descuento: null,
  },
  {
    productoId: 9004,
    especificoId: 900104,
    nombre: "Vestido satinado terracota",
    imagen:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=80",
    precio: 199.9,
    descuento: 15,
  },
  {
    productoId: 9005,
    especificoId: 900105,
    nombre: "Zapatillas esenciales blanco nieve",
    imagen:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=640&q=80",
    precio: 159.0,
    descuento: null,
  },
];

function mapProduct(apiProduct: ApiProduct): ProfileMockProduct | null {
  if (!apiProduct?.id_producto_especifico || !apiProduct?.producto_id)
    return null;
  return {
    productoId: apiProduct.producto_id,
    especificoId: apiProduct.id_producto_especifico,
    nombre: apiProduct.nombre ?? "Producto StyleHub",
    imagen: apiProduct.imagen_producto ?? "",
    precio: typeof apiProduct.precio === "number" ? apiProduct.precio : 0,
    descuento: apiProduct.porcentaje_desc ?? null,
  };
}

function pickRandom<T>(items: T[], count: number): T[] {
  if (items.length <= count) return [...items];
  const selected: T[] = [];
  const used = new Set<number>();
  while (selected.length < count && used.size < items.length) {
    const index = Math.floor(Math.random() * items.length);
    if (used.has(index)) continue;
    used.add(index);
    selected.push(items[index]);
  }
  return selected;
}

function formatDateRelative(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildMockEntries(products: ProfileMockProduct[]): ProfileMockDataset {
  const highlights = products.slice(0, 5);
  const [first, second] = highlights;
  const baseEntries = [first, second].filter(Boolean) as ProfileMockProduct[];

  const pedidoEstados = ["Preparando envío", "En tránsito"];
  const devolucionEstados = ["En evaluación", "Recibido en almacén"];
  const cambioEstados = ["Cambio aprobado", "Cambio en camino"];

  const pedidos: ProfileMockEntry[] = baseEntries.map((producto, idx) => ({
    producto,
    estado: pedidoEstados[idx] ?? "Procesando",
    fecha: formatDateRelative(idx + 1),
    codigo: `#${producto.especificoId.toString().padStart(6, "0")}`,
    accionLabel: "Seguir pedido",
    accionHref: "/profile/pedidos",
  }));

  const devoluciones: ProfileMockEntry[] = baseEntries.map((producto, idx) => ({
    producto,
    estado: devolucionEstados[idx] ?? "Recibido",
    fecha: formatDateRelative(idx + 3),
    codigo: `#R-${producto.especificoId.toString().padStart(5, "0")}`,
    accionLabel: "Ver detalles",
    accionHref: "/profile/devoluciones-cambios",
  }));

  const cambios: ProfileMockEntry[] = baseEntries.map((producto, idx) => ({
    producto,
    estado: cambioEstados[idx] ?? "En revisión",
    fecha: formatDateRelative(idx + 5),
    codigo: `#C-${producto.especificoId.toString().padStart(5, "0")}`,
    accionLabel: "Ver artículo",
    accionHref: "/profile/devoluciones-cambios",
  }));

  return {
    highlights,
    pedidos,
    devoluciones,
    cambios,
    updatedAt: Date.now(),
  };
}

function buildFallbackDataset(): ProfileMockDataset {
  const dataset = buildMockEntries([...FALLBACK_PRODUCTS]);
  return {
    ...dataset,
    updatedAt: Date.now(),
  };
}

function loadFromStorage(): ProfileMockDataset | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProfileMockDataset;
    if (!parsed?.updatedAt) return null;
    const age = Date.now() - parsed.updatedAt;
    if (age > MAX_AGE_MS) return null;
    return parsed;
  } catch (error) {
    console.warn("No se pudo leer dataset de sesión:", error);
    return null;
  }
}

function saveToStorage(dataset: ProfileMockDataset) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
}

export function useProfileMockData(
  options: UseProfileMockDataOptions = { initialize: false }
) {
  const { initialize = false } = options;
  const [dataset, setDataset] = useState<ProfileMockDataset | null>(() =>
    loadFromStorage()
  );
  const [loading, setLoading] = useState(!dataset);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const shouldFetch = initialize || !dataset;
    if (!shouldFetch) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/productos?limit=40", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("No se pudieron obtener productos");
        }
        const data = await response.json();
        const list: ApiProduct[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];
        const mapped = list
          .map(mapProduct)
          .filter((item): item is ProfileMockProduct => item !== null);
        if (mapped.length === 0) {
          throw new Error("No hay productos disponibles");
        }
        const selected = pickRandom(mapped, Math.min(5, mapped.length));
        const datasetGenerated = buildMockEntries(selected);
        if (ignore) return;
        saveToStorage(datasetGenerated);
        setDataset(datasetGenerated);
      } catch (err) {
        console.error("Error generando dataset de perfil:", err);
        if (!ignore) {
          const fallbackDataset = buildFallbackDataset();
          saveToStorage(fallbackDataset);
          setDataset(fallbackDataset);
          setError(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialize]);

  const value = useMemo(
    () => ({ dataset, loading, error }),
    [dataset, loading, error]
  );

  return value;
}
