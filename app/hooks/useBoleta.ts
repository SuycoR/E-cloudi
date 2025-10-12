"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/app/context/CartContext";
import { useCheckout } from "@/app/context/CheckoutContext";
import { enviarDatosBoletaApi } from "@/lib/boleta";
import {
  ItemPayload,
  GenerarBoletaPayload,
} from "@/app/types/GenerarBoletaPayload";
import { getUltimoPagoMercadoPago } from "@/app/utils/getUltimoPagoMercadoPago";

export function useBoleta() {
  const { data: session } = useSession();
  const { cart } = useCart();
  const { orden } = useCheckout();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function generar() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Obtener los datos del último pago desde la API
    const pago = await getUltimoPagoMercadoPago();
    if (!pago) {
      setError("No hay datos de pago disponibles");
      setLoading(false);
      return;
    }
    console.log("[useBoleta] Datos de pago recibidos:", pago);
    
    if(pago.tipo_pago === "credit_card"){
      pago.tipo_pago = 1;
    } else if(pago.tipo_pago === "bank_transfer"){
      pago.tipo_pago = 3;
    } else if(pago.tipo_pago === "debit_card"){
      pago.tipo_pago = 2;   }
    // Mapear los datos del pago a los campos requeridos
    const usuarioId = pago.usuario_id;
    const metodoPagoId = pago.tipo_pago;
    const direccionEnvioId = pago.direccion_envio_id;
    const metodoEnvioId = pago.metodo_envio_id;
    const subtotal = pago.subtotal_orden ?? 0;
    const costoEnvio = pago.costo_envio ?? 0;
    const total = pago.total ?? subtotal + costoEnvio;
    const items: ItemPayload[] = Array.isArray(pago.cart_resumen)
      ? pago.cart_resumen.map((item: { nombre: string; cantidad: number; precioOriginal?: number; precio_original?: number }) => ({
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioOriginal ?? item.precio_original ?? 0,
        }))
      : [];

    // LOG: Datos que se enviarán en el payload
    console.log("[useBoleta] Payload generado:", {
      usuarioId,
      metodoPagoId,
      direccionEnvioId,
      metodoEnvioId,
      items,
      subtotal,
      costoEnvio,
      total,
    });

    const payload: GenerarBoletaPayload = {
      usuarioId,
      metodoPagoId,
      direccionEnvioId,
      metodoEnvioId:1,
      estadoOrdenId: 1,
      items,
      subtotal,
      costoEnvio,
      total,
    };

    try {
      await enviarDatosBoletaApi(payload);
      setSuccess(true);
      //clearCart();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error generando boleta");
    } finally {
      setLoading(false);
    }
  }

  return { generar, loading, error, success };
}
