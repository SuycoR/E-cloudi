// /pages/api/direccion/route.ts
import { NextResponse } from "next/server";
import { db }            from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const usuario_id = url.searchParams.get("usuario_id");

  if (!usuario_id) {
    return NextResponse.json({ error: "El usuario_id es requerido." }, { status: 400 });
  }

  try {
    // Llamada al stored procedure
    const [rows]: any[] = await db.query(
      "CALL sp_listar_direcciones_usuario(?)",
      [parseInt(usuario_id, 10)]
    );
    //console.log("Llamada al stored procedure sp_listar_direcciones_usuario con usuario_id:", usuario_id);
    //console.log("Resultados de la llamada al stored procedure:", rows);
    // MySQL devuelve los resultados en rows[0]
    const results = rows[0];
    //console.log("Resultados de direcciones:", results);

    // cuenca

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron direcciones para este usuario." },
        { status: 404 }
      );
    }


    return NextResponse.json(results);
  } catch (error) {
    console.error("Error al obtener las direcciones:", error);
    return NextResponse.json(
      { error: "Error al obtener las direcciones" },
      { status: 500 }
    );
  }
}
