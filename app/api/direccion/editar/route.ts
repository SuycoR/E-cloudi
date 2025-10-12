// app/api/direccion/editar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const {
      direccion_id,
      usuario_id,
      piso,
      lote,
      calle,
      distrito,
      codigo_postal,
      //isPrimary
    } = await req.json();

    if (!direccion_id || !usuario_id) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    await db.query(
      `CALL ActualizarDireccionUsuario(?, ?, ?, ?, ?, ?, ?,  @resultado);`,
      [
        direccion_id,
        usuario_id,
        piso,
        lote,
        calle,
        distrito,
        codigo_postal,
        //isPrimary ? 1 : 0
      ]
    );

    // Ya que no puedes hacer SELECT, asumimos que si no lanza error, está OK
    return NextResponse.json({ message: "Dirección actualizada correctamente" });

  } catch (error: any) {
    console.error("Error en la API de actualizar dirección:", error);

    // Extraer mensaje de error si existe
    const mensaje = error?.sqlMessage || "Error del servidor";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
