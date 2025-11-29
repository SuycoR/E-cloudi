// app/api/generar-boleta/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { generarBoletaPDF } from "@/lib/pdf";
import nodemailer from "nodemailer";

interface InfoBoletaRow extends RowDataPacket {
  r_nombre: string;
  r_identificacion: string;
  r_email: string;
  r_tipo_pago: string;
  r_piso: string | null;
  r_lote: string | null;
  r_calle: string | null;
  r_distrito: string;
  r_provincia: string;
  r_departamento: string;
  r_pais: string;
  r_metodo_envio: string;
  r_estado: string;
}

export async function POST(request: Request) {
  try {
    const {
      usuarioId,
      metodoPagoId,
      direccionEnvioId,
      metodoEnvioId,
      estadoOrdenId,
      items,
      subtotal,
      costoEnvio,
      total,
    } = await request.json();

    // 1) Ejecutar SP y extraer la primera fila
    const [resultSets] = await db.query<InfoBoletaRow[][]>(
      "CALL sp_obtener_datos_boleta(?,?,?,?,?)",
      [usuarioId, metodoPagoId, direccionEnvioId, metodoEnvioId, estadoOrdenId]
    );
    const info = resultSets[0]?.[0];

    console.log("Route - InfoBoleta:", info);
    console.log("Route - Items:", items);
    console.log(
      "Route - Subtotal, CostoEnvío, Total:",
      subtotal,
      costoEnvio,
      total
    );

    if (!info) {
      return NextResponse.json(
        { error: "No se encontraron datos para la boleta especificada." },
        { status: 404 }
      );
    }

    // 2) Validar email
    if (!info.r_email?.trim()) {
      return NextResponse.json(
        { error: "Email del destinatario no disponible." },
        { status: 400 }
      );
    }
    console.log(
      typeof subtotal,
      subtotal,
      typeof costoEnvio,
      costoEnvio,
      typeof total,
      total
    );
    // 3) Generar PDF
    const pdfBuffer = await generarBoletaPDF(
      info,
      items,
      subtotal,
      costoEnvio,
      subtotal + costoEnvio
    );
    if (!Buffer.isBuffer(pdfBuffer)) {
      throw new Error("El PDF generado no es un Buffer.");
    }

    // 4) Configurar y enviar correo
    const { MAIL_USER, MAIL_PASS } = process.env;
    if (!MAIL_USER || !MAIL_PASS) {
      throw new Error("Credenciales de correo no configuradas.");
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    await transporter.sendMail({
      from: MAIL_USER,
      to: info.r_email.trim(),
      subject: "ecloudi: Boleta",
      text: "Gracias por tu compra, agradecemos su confianza en nuestro servicio.",
      attachments: [{ filename: "boleta_compra.pdf", content: pdfBuffer }],
    });

    return NextResponse.json({ message: "Boleta generada y enviada." });
  } catch (error) {
    console.error("Error en POST /api/generar-boleta:", error);
    return NextResponse.json(
      { error: "Error interno al generar o enviar la boleta." },
      { status: 500 }
    );
  }
}
