"use server";

import api from "@/app/(client)/venta/metodo-pago/api";
import { redirect } from "next/navigation";

interface CartItem {
  productId: number;
  nombre: string;
  cantidad: number;
  precio: number;
  precioOriginal?: number;
  descuento?: number;
  id_producto_especifico?: number;
}

interface CartResumenItem {
  id_producto_especifico?: number;
  productId?: number;
  precioOriginal?: number;
  descuento?: number;
  cantidad: number;
}

interface CheckoutMetadata {
  usuario_id?: string | null;
  usuarioId?: string | null;
  direccion_envio_id?: number | null;
  direccionEnvioId?: number | null;
  metodo_envio_id?: number | null;
  metodoEnvioId?: number | null;
  subtotal: number;
  costo_envio?: number;
  costoEnvio?: number;
  total: number;
  cartResumen?: CartResumenItem[];
  cart_resumen?: CartResumenItem[];
}

// Esta función debe recibir los datos del carrito y del checkout
export async function crearPreferenciaMP({
  cart,
  metadata,
}: {
  cart: CartItem[];
  metadata: CheckoutMetadata;
}) {
  const url = await api.message.submit({ cart, metadata });
  redirect(url);
}
