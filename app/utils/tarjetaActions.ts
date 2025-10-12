// app/utils/tarjetaActions.ts

import { MetodoPagoRow } from "@/app/types/metodoPago";

export interface SaveTarjetaParams {
  /** Si viene, actualiza; si no, crea nuevo */
  id?: number;
  userId: number;
  tipoPagoId: number;
  proveedor: string;
  numeroCuenta: string;
  fechaVencimiento: string; // "YYYY-MM-DD"
  isPrimary: boolean;
}

/**
 * Obtiene todos los métodos de pago de un usuario.
 */
export async function getTarjetas(userId: number): Promise<MetodoPagoRow[]> {
  const res = await fetch(`/api/metodo-pago?user_id=${userId}`);
  if (!res.ok) {
    throw new Error("Error al cargar métodos de pago");
  }
  return res.json();
}

/**
 * Crea o actualiza un método de pago.
 */
export async function saveTarjeta(
  tarjeta: SaveTarjetaParams
): Promise<MetodoPagoRow> {
  const isUpdate = Boolean(tarjeta.id);
  const url = isUpdate
    ? `/api/metodo-pago/${tarjeta.id}`
    : `/api/metodo-pago`;
  const res = await fetch(url, {
    method: isUpdate ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: tarjeta.userId,
      tipoPagoId: tarjeta.tipoPagoId,
      proveedor: tarjeta.proveedor,
      numeroCuenta: tarjeta.numeroCuenta,
      fechaVencimiento: tarjeta.fechaVencimiento,
      isPrimary: tarjeta.isPrimary ? 1 : 0,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al guardar método de pago");
  }
  return res.json();
}

/**
 * Elimina un método de pago por su ID.
 */
export async function deleteTarjeta(
  id: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await fetch(`/api/metodo-pago/${id}`, {
    method: "DELETE",
  });
  if (res.ok) {
    return { ok: true };
  }
  const body = await res.json();
  return { ok: false, message: body.error || "Error al eliminar método" };
}
