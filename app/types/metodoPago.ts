import { RowDataPacket } from "mysql2";
export interface MetodoPagoRow extends RowDataPacket {
  id: number;
  id_usuario: number;
  id_tipo_pago: number;
  proveedor: string;
  numero_cuenta: string;
  fecha_vencimiento: string;      // DATE → string “YYYY-MM-DD”
  es_predeterminado: 0 | 1;
  // opcionalmente el valor legible:
  tipo?: string;
}