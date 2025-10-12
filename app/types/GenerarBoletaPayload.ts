
export interface ItemPayload {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface GenerarBoletaPayload {
  usuarioId: string;
  metodoPagoId: number | null;
  direccionEnvioId: number | null;
  metodoEnvioId: number | null;
  estadoOrdenId: number | null;
  items: ItemPayload[];
  subtotal: number;
  costoEnvio: number;
  total: number;
}