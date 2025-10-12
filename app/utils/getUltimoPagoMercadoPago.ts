// utils/getUltimoPagoMercadoPago.ts

export async function getUltimoPagoMercadoPago() {
  try {
    const res = await fetch("/api/mercadopago", { cache: "no-store" });
    if (!res.ok) throw new Error("No hay pago registrado");
    return await res.json();
  } catch (e) {
    console.error("[getUltimoPagoMercadoPago] Error:", e);
    return null;
  }
}
