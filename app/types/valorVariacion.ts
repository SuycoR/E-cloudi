// /app/types/valorVariacion.ts

export interface Valor {
    id_valor:number
    nombre_valor: string;
}

export interface Variacion {
  id_variacion: number;
  nombre_variacion: string;
  valores: Valor[];
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  variaciones: Variacion[];
}