"use server";

import api from "@/app/(client)/venta/metodo-pago/api";
import { redirect } from "next/navigation";

// Esta función debe recibir los datos del carrito y del checkout
export async function crearPreferenciaMP({ cart, metadata }) {
  const url = await api.message.submit({ cart, metadata });
  redirect(url);
}
