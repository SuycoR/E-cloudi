export interface CategoriaNivel1 {
    id: number;
    nombre: string;
    subcategorias?: CategoriaNivel2[];
}

export interface CategoriaNivel2 {
    id: number;
    nombre: string;
    subcategorias?: CategoriaNivel3[];
}

export interface CategoriaNivel3 {
    id: number;
    nombre: string;
}