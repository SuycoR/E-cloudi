// /app/types/props.ts

export interface DrawerProps  {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement>;
};

export interface ProductSectionProps {
  title: string;
  filterType: 'bestSellers' | 'newArrivals' | 'onSale' | 'byCategory' | 'byPromotion' | 'onlyPromotions' | '' | 'all'| 'byVariacion';
  categoryId?: number;
  categoryLevel?: number;
  promotionId?: number;
  asCarousel?: boolean;
  asGrid?: boolean;
  gridColumns?: number;
  limit?: number;
  selectedVariations?: number[]; // <-- Aquí agregamos selectedVariations
  MinPrecioEnvia?: string | null;  // Opcional, si se usa filtro de precio
  MaxPrecioEnvia?: string | null; // Opcional, si se usa filtro de precio
  minPrecio?: string | null; // Opcional, si se usa filtro de precio
  maxPrecio?: string | null; // Opcional, si se usa filtro de precio
  onPrecioChange?: (min: string | null, max: string | null) => void;
  itemsPage?: number; // Opcional, si se usa paginación
}

export interface ProductCardProps {
  id?: number;
  producto_id?: number; 
  id_producto_especifico?: number; // Opcional si no siempre se muestra
  nombre: string;
  descripcion?: string;
  imagen_producto: string;
  precio: number; // Opcional si no siempre se muestra el precio
  descuento?: number; // Opcional si no siempre se muestra el descuento
  porcentaje_desc?: number; // Opcional si no siempre se muestra el porcentaje de descuento
}

export interface ProductListProps {
  productos: ProductCardProps[];
  horizontal?: boolean;
  itemsPage?: number; // Opcional, si se usa paginación
}

export interface ProductCarouselProps {
  productos: ProductCardProps[];
}

export interface ProductDetailProps extends ProductCardProps {
  SKU: string;
  cantidad_stock: number;
  imagen_producto: string;
  marca: string | null; 
  logo: string | null; 
  descripcion: string; // sobreescribe la obligatoriedad de descripcion
  especificaciones: string | null;
  tipo_especificaciones: string | null;
  nivel_1: string;
  nivel_2: string | null;
  nivel_3: string | null;
  nombre_promocion: string;
  id_cat_n1: number | null;
  id_cat_n2: number | null;
  id_cat_n3: number | null;
}
