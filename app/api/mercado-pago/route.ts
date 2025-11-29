import { Payment } from "mercadopago";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { mercadopago } from "@/app/(client)/venta/metodo-pago/api";
import type { ResultSetHeader } from "mysql2";

// Variable global temporal para almacenar el último pago
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lastPaymentResumen: any = null;

export async function POST(request: Request) {
  console.log("[POST] /api/mercado-pago - Nueva petición recibida");
  // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
  const body: { data: { id: string } } = await request.json();
  console.log("[POST] Body recibido:", body);

  // Obtenemos el pago
  let payment;
  try {
    payment = await new Payment(mercadopago).get({ id: body.data.id });
    console.log("[POST] Payment obtenido:", payment);
  } catch (e) {
    console.error("[POST] Error obteniendo payment:", e);
    return new Response(null, { status: 500 });
  }

  // Si se aprueba, guardamos los datos relevantes y revalidamos resumen
  if (payment.status === "approved") {
    console.log("[POST] Payment aprobado, procesando inserciones...");
    // Guardar los datos relevantes del pago en memoria
    lastPaymentResumen = {
      fecha_creacion: payment.date_created,
      metodo_pago: payment.payment_method_id,
      estado_orden: payment.status,
      subtotal_orden: payment.metadata?.subtotal,
      tipo_pago: payment.payment_type_id,
      proveedor: payment.card?.cardholder?.name ?? payment.payment_method?.id,
      primeros6: payment.card?.first_six_digits,
      ultimos4: payment.card?.last_four_digits,
      fecha_expiracion: payment.card
        ? `${payment.card.expiration_month}/${payment.card.expiration_year}`
        : "",
      es_predeterminada: "N/A", // No disponible en MercadoPago
      usuario_id: payment.metadata?.usuario_id,
      direccion_envio_id: payment.metadata?.direccion_envio_id,
      metodo_envio_id: payment.metadata?.metodo_envio_id,
      costo_envio: payment.metadata?.costo_envio,
      total: payment.metadata?.total,
      cart_resumen: payment.metadata?.cart_resumen,
    };
    console.log("[POST] lastPaymentResumen:", lastPaymentResumen);

    // Mapear el método de pago a id interno
    const id_tipo_pago = mapMetodoPagoId(payment);
    console.log("[POST] id_tipo_pago mapeado:", id_tipo_pago);
    if (!id_tipo_pago) {
      // Si el método de pago no es permitido, no insertar nada
      console.error("[POST] Método de pago no permitido o no mapeado");
      return new Response(null, { status: 200 });
    }

    // Insertar método de pago utilizado en usuario_metodo_pago
    try {
      const id_usuario = payment.metadata?.usuario_id;
      // El campo issuer puede no existir, fallback a payment_method_id
      let proveedor = null;
      // MercadoPago puede no exponer issuer, así que solo usamos payment_method_id o payment_method.id
      if (payment.payment_method && payment.payment_method.id) {
        proveedor = payment.payment_method.id;
      } else if (payment.payment_method_id) {
        proveedor = payment.payment_method_id;
      }
      const numero_cuenta = payment.card?.last_four_digits || null;
      // Fecha de vencimiento: YYYY-MM-DD si aplica, si no, null
      let fecha_vencimiento = null;
      if (payment.card?.expiration_year && payment.card?.expiration_month) {
        // Si MercadoPago da año/mes, formatear a YYYY-MM-DD (día 01 por defecto)
        fecha_vencimiento = `${payment.card.expiration_year}-${String(
          payment.card.expiration_month
        ).padStart(2, "0")}-01`;
      }
      console.log("[POST] Insertando en usuario_metodo_pago:", {
        id_usuario,
        id_tipo_pago,
        proveedor,
        numero_cuenta,
        fecha_vencimiento,
      });
      const result = await db.query(
        `INSERT INTO usuario_metodo_pago (id_usuario, id_tipo_pago, proveedor, numero_cuenta, fecha_vencimiento, es_predeterminado)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [id_usuario, id_tipo_pago, proveedor, numero_cuenta, fecha_vencimiento]
      );
      console.log("[POST] Resultado usuario_metodo_pago:", result);
    } catch (e) {
      console.error("[POST] Error insertando en usuario_metodo_pago:", e);
    }

    // Insertar en la tabla orden y obtener el id insertado
    let insertResult: ResultSetHeader | undefined;
    try {
      console.log("[POST] Insertando en orden:", {
        id_usuario: payment.metadata?.usuario_id || null,
        fecha_creacion: payment.date_created,
        id_tipo_pago,
        id_direccion_envio: payment.metadata?.direccion_envio_id,
        id_metodo_envio: payment.metadata?.metodo_envio_id || null,
        id_estado_orden: 1,
        subtotal_orden: payment.metadata?.subtotal || 0,
        costo_envio: payment.metadata?.costo_envio || 0,
        total_orden: payment.metadata?.subtotal + payment.metadata?.costo_envio || 0,
      });
      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO orden (
          id_usuario, fecha_creacion, id_metodo_pago, id_direccion_envio, id_metodo_envio, id_estado_orden, subtotal_orden, costo_envío, total_orden
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payment.metadata?.usuario_id || null,
          payment.date_created,
          id_tipo_pago, // Usar el id mapeado
          payment.metadata?.direccion_envio_id,
          payment.metadata?.metodo_envio_id || null,
          1, // id_estado_orden (ajusta si tienes el dato)
          payment.metadata?.subtotal || 0,
          payment.metadata?.costo_envio || 0,
          payment.metadata?.subtotal + payment.metadata?.costo_envio || 0, // Aseguramos que el total incluya el costo de envío
        ]
      );
      insertResult = result;
      console.log("[POST] Resultado orden:", result);
    } catch (e) {
      console.error("[POST] Error insertando en orden:", e);
    }

    // Insertar productos en orden_producto_especifico
    try {
      const id_orden = insertResult?.insertId;
      console.log("[POST] id_orden para productos:", id_orden);

      if (id_orden && Array.isArray(payment.metadata?.cart_resumen)) {
        console.log(
          "[POST] payment.metadata.cart_resumen:",
          payment.metadata.cart_resumen
        );

        for (const item of payment.metadata.cart_resumen) {
          // Compatibilidad: aceptar precioOriginal o precio_original
          const precioOriginal =
            item.precioOriginal !== undefined
              ? Number(item.precioOriginal)
              : item.precio_original !== undefined
              ? Number(item.precio_original)
              : 0;
          const descuento = Number(item.descuento ?? 0);
          const cantidad = Number(item.cantidad ?? 1);
          const subtotal_linea =
            !isNaN(precioOriginal) && !isNaN(descuento) && !isNaN(cantidad)
              ? (precioOriginal - descuento) * cantidad
              : 0;
          // DEBUG: Log de los valores recibidos para cada producto
          console.log("[POST] Insertando en orden_producto_especifico:", {
            id_orden,
            id_producto_especifico: item.id_producto_especifico,
            precioOriginal,
            descuento,
            cantidad,
            subtotal_linea,
          });
          const result = await db.query(
            `INSERT INTO orden_producto_especifico (
              id_orden, id_producto_especifico, precio_unitario, descuento_unitario, cantidad, subtotal_linea
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              id_orden,
              item.id_producto_especifico,
              isNaN(precioOriginal) ? 0 : precioOriginal,
              isNaN(descuento) ? 0 : descuento,
              isNaN(cantidad) ? 1 : cantidad,
              isNaN(subtotal_linea) ? 0 : subtotal_linea,
            ]
          );
          console.log("[POST] Resultado orden_producto_especifico:", result);
        }
      }
    } catch (e) {
      console.error("[POST] Error insertando en orden_producto_especifico:", e);
    }

    console.log("[POST] Revalidando /venta/resumen");
    revalidatePath("/venta/resumen");
  } else {
    console.log("[POST] Payment no aprobado, status:", payment.status);
  }

  // Respondemos con un estado 200 para indicarle que la notificación fue recibida
  console.log("[POST] Respondiendo 200 OK");
  return new Response(null, { status: 200 });
}

// Endpoint GET para obtener el último pago
export async function GET() {
  console.log("[GET] /api/mercado-pago - Consultando último pago");
  if (lastPaymentResumen) {
    console.log("[GET] Último pago encontrado:", lastPaymentResumen);
    return new Response(JSON.stringify(lastPaymentResumen), { status: 200 });
  } else {
    console.log("[GET] No hay pago registrado");
    return new Response(JSON.stringify({ error: "No hay pago registrado" }), {
      status: 404,
    });
  }
}

// Mapear el método de pago de MercadoPago a los IDs de tu base de datos
function mapMetodoPagoId(payment: any): number {
  // payment.payment_method_id y payment.payment_type_id pueden ayudar
  // Tabla de referencia:
  // 1: Tarjeta de crédito
  // 2: Tarjeta de débito
  // 3: Transferencia bancaria
  // 4: Yape
  // 5: Plin
  const type = payment.payment_type_id;
  const method = (payment.payment_method_id || "").toLowerCase();
  if (type === "credit_card") return 1;
  if (type === "debit_card") return 2;
  if (type === "bank_transfer") return 3;
  if (method.includes("yape")) return 4;
  if (method.includes("plin")) return 5;
  // Si no es ninguno, retorna null o lanza error
  return 0;
}
