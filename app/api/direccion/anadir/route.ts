import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asegúrate de que sea tu conexión mysql2/promise

export async function POST(req: NextRequest) {
  try {
    const {
      usuario_id,
      piso,
      lote,
      calle,
      distrito, // <- nombre del distrito, no ID
      codigo_postal,
      //isPrimary, // booleano
    } = await req.json();

    //const es_predeterminado = isPrimary ? 1 : 0;

    // Ejecutamos el procedimiento almacenado
    const [rows]: any = await db.query(
      `CALL CrearDireccionConUsuario(?, ?, ?, ?, ?, ?, @direccion_id, @resultado)`,
      [
        usuario_id,
        piso,
        lote,
        calle,
        distrito,
        codigo_postal,
        //es_predeterminado
      ]
    );

    // Obtenemos los resultados de salida
    const [[salida]]: any = await db.query(`SELECT @direccion_id AS direccion_id, @resultado AS resultado`);

    return NextResponse.json({
      direccion_id: salida.direccion_id,
      resultado: salida.resultado,
    }, { status: 201 });

  } catch (error) {
    console.error("Error al llamar al procedimiento:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
