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

    const usuarioId = orden.usuarioId ?? session?.user?.id;
    if (!usuarioId) {
      setError("No se encontró un usuario para generar la boleta.");
      setLoading(false);
      return;
    }

    if (!orden.metodoPagoId) {
      setError(
        "Debes seleccionar un método de pago antes de generar la boleta."
      );
      setLoading(false);
      return;
    }

    const subtotal =
      orden.subtotal && orden.subtotal > 0
        ? orden.subtotal
        : cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const costoEnvio =
      typeof orden.costoEnvio === "number" ? orden.costoEnvio : 0;
    const total = orden.total ?? subtotal + costoEnvio;

    const items: ItemPayload[] = cart.map((item) => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precioOriginal ?? item.precio,
    }));

    const payload: GenerarBoletaPayload = {
      usuarioId: String(usuarioId),
      metodoPagoId: orden.metodoPagoId,
      direccionEnvioId: orden.direccionEnvioId ?? null,
      metodoEnvioId: orden.metodoEnvioId ?? null,
      estadoOrdenId: orden.estadoOrdenId ?? 1,
      items,
      subtotal,
      costoEnvio,
      total,
    };

    try {
      await enviarDatosBoletaApi(payload);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error generando boleta");
    } finally {
      setLoading(false);
    }
  }

  return { generar, loading, error, success };
}
