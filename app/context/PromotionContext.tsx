// app/context/PromotionContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

/* ---------- Interfaz del draft de promoción ---------- */
export interface PromotionDraft {
  nombre: string;
  descripcion: string;
  img_promocional: string;
  fecha_inicio: string;
  fecha_fin: string;
  porcentaje_descuento: number;
  nivel: number; // Ahora es número
  combinable: boolean;
}

/* ---------- Tipo del contexto ---------- */
interface PromotionContextType {
  promotionDraft: PromotionDraft;
  setPromotionDraft: React.Dispatch<React.SetStateAction<PromotionDraft>>;
  destino: {
    tipo: 'CATEGORIA' | 'PRODUCTO' | 'FECHA_LLEGADA' | 'STOCK' | 'PRECIO';
    ids: number[];
  };
  setDestino: React.Dispatch<React.SetStateAction<{ tipo: 'CATEGORIA' | 'PRODUCTO' | 'FECHA_LLEGADA' | 'STOCK' | 'PRECIO'; ids: number[] }>>;
  subcategoriasSeleccionadas: Set<number>;
  setSubcategoriasSeleccionadas: React.Dispatch<React.SetStateAction<Set<number>>>;
}

/* ---------- Valores por defecto ---------- */
const defaultPromotionDraft: PromotionDraft = {
  nombre: '',
  descripcion: '',
  img_promocional: '',
  fecha_inicio: '',
  fecha_fin: '',
  porcentaje_descuento: 0,
  nivel: 1,
  combinable: false,
};

// Definimos explícitamente el tipo para evitar errores en setDestino
const defaultDestino: { tipo: 'CATEGORIA' | 'PRODUCTO' | 'FECHA_LLEGADA' | 'STOCK' | 'PRECIO'; ids: number[] } = {
  tipo: 'CATEGORIA',
  ids: [],
};

/* ---------- Context & Provider ---------- */
const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [promotionDraft, setPromotionDraft] = useState<PromotionDraft>(defaultPromotionDraft);
  const [destino, setDestino] = useState<{ tipo: 'CATEGORIA' | 'PRODUCTO' | 'FECHA_LLEGADA' | 'STOCK' | 'PRECIO'; ids: number[] }>(
    defaultDestino
  );
  const [subcategoriasSeleccionadas, setSubcategoriasSeleccionadas] = useState<Set<number>>(new Set());

  return (
    <PromotionContext.Provider value={{ 
      promotionDraft, 
      setPromotionDraft, 
      destino, 
      setDestino,
      subcategoriasSeleccionadas,
      setSubcategoriasSeleccionadas
    }}>
      {children}
    </PromotionContext.Provider>
  );
}

/* ---------- Hook para consumir ---------- */
export function usePromotion() {
  const ctx = useContext(PromotionContext);
  if (!ctx) {
    throw new Error('usePromotion debe usarse dentro de PromotionProvider');
  }
  return ctx;
}