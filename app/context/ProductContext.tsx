'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interfaces para manejo de variaciones desde DB
export interface Variacion {
  id: number;           // ID de la variación general (ej. 1 para "Color")
  nombre: string;       // Nombre de la variación general (ej. "Color")
}

export interface ValorVariacion {
  id: number;           // ID de la opción específica (ej. 4 para "Rojo")
  valor: string;        // Nombre de la opción (ej. "Rojo")
  id_variacion: number; // ID de la variación a la que pertenece esta opción
}

// Interface para variaciones seleccionadas en un producto específico
export interface VariacionProducto {
  tipo: string;              // Nombre de la variación (ej. "Color")
  tipoId?: number;           // ID de la variación general (ej. 1)
  valor: string;             // Valor elegido (ej. "Rojo")
  id_variacion_opcion?: number; // ID del valor elegido (ej. 4)
}

// Producto general
export interface ProductoGeneral {
  nombre: string;
  descripcion: string;
  imagen_producto: string;
  categoria1: string;
  categoria2: string;
  categoria3: string;
  marca: string;
}

// Producto específico
export interface ProductoEspecifico {
  sku: string;
  precio: number | string;
  stock: number | string;
  imagen: string;
  variaciones: VariacionProducto[];
}

// Tipo del contexto
interface ProductContextType {
  productoGeneral: ProductoGeneral;
  setProductoGeneral: React.Dispatch<React.SetStateAction<ProductoGeneral>>;
  productosEspecificos: ProductoEspecifico[];
  setProductosEspecificos: React.Dispatch<React.SetStateAction<ProductoEspecifico[]>>;
}

// Valores por defecto
const defaultProductoGeneral: ProductoGeneral = {
  nombre: '',
  descripcion: '',
  imagen_producto: '',
  categoria1: '',
  categoria2: '',
  categoria3: '',
  marca: '',
};

const defaultProductosEspecificos: ProductoEspecifico[] = [
  {
    sku: '',
    precio: '',
    stock: '',
    imagen: '',
    variaciones: [{ tipo: '', valor: '' }],
  },
];

// Crear contexto
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Proveedor
export function ProductProvider({ children }: { children: ReactNode }) {
  const [productoGeneral, setProductoGeneral] = useState<ProductoGeneral>(defaultProductoGeneral);
  const [productosEspecificos, setProductosEspecificos] = useState<ProductoEspecifico[]>(defaultProductosEspecificos);

  return (
    <ProductContext.Provider
      value={{ productoGeneral, setProductoGeneral, productosEspecificos, setProductosEspecificos }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// Hook para consumir contexto
export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct debe usarse dentro de un ProductProvider');
  }
  return context;
}
