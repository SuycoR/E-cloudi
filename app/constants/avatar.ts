import type { AvatarColorSwatch, PhotoScore } from "@/types/avatar";

export const DEFAULT_PHOTO_SCORES: PhotoScore[] = [
  { label: "Iluminación", value: 95 },
  { label: "Nitidez", value: 88 },
  { label: "Postura", value: 94 },
  { label: "Encuadre", value: 90 },
];

export const DEFAULT_RECOMMENDED_COLORS: AvatarColorSwatch[] = [
  { name: "Terracota", hex: "#DB705C" },
  { name: "Oliva", hex: "#7E8F41" },
  { name: "Mostaza", hex: "#D9A441" },
  { name: "Camel", hex: "#C8A274" },
  { name: "Chocolate", hex: "#7A4A2C" },
  { name: "Beige Cálido", hex: "#E3C9A8" },
];

export const DEFAULT_AVOID_COLORS: AvatarColorSwatch[] = [
  { name: "Negro Puro", hex: "#1A1A1A" },
  { name: "Gris Frío", hex: "#9AA5B1" },
  { name: "Azul Hielo", hex: "#C8D9F1" },
];

export const DEFAULT_COLOR_PROFILE = {
  temporada: "Otoño",
  tono: "Cálido - Medio",
  subtono: "Dorado",
};
