import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl; // Usamos nextUrl para obtener los searchParams
  const usuarioId = searchParams.get("usuario_id"); // Obtenemos el usuario_id de los searchParams

  if (!usuarioId) {
    return NextResponse.json({ error: "usuario_id es requerido" }, { status: 400 });
  }

  try {
    const [rows]: any = await db.query(`
      SELECT o.id, o.total_orden, eo.estado, d.calle, d.lote, d.piso, di.nombre AS distrito
      FROM orden_producto_especifico AS ope
      JOIN orden AS o ON o.id = ope.id_orden
      JOIN estado_orden AS eo ON eo.id = o.id_estado_orden 
      JOIN direccion AS d ON d.id = o.id_direccion_envio
      JOIN distrito AS di ON di.id = d.id_distrito
      WHERE o.id_usuario = ? 
      LIMIT 10
    `, [usuarioId]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error en la API de pedidos:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
