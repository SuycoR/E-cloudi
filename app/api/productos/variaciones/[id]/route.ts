// app/api/productos/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  // Desestructuramos directamente `{ params }`. Next sabe internamente que
  // `params` es una Promise<{ id: string }>, así que no lo anotamos con un tipo rígido.
  { params }: { params: any }
) {
  // Ahora hacemos await sobre `params` para extraer el id correctamente:
  const { id } = await params;

  // Convertimos a entero y escapamos la entrada para evitar inyección SQL:
  const productoId = db.escape(parseInt(id, 10));

  const sql = `
    SELECT
      pe.id     AS id_producto_especifico,
      JSON_OBJECTAGG(v.nombre, vo.valor) AS especificaciones	
    FROM producto_especifico AS pe
    JOIN producto AS p
      ON p.id = pe.id_producto
    LEFT JOIN combinaciones_producto AS cp
      ON pe.id = cp.id_producto_especifico
    LEFT JOIN variacion_opcion AS vo
      ON cp.id_variacion_opcion = vo.id
    LEFT JOIN variacion AS v
      ON v.id = vo.id_variacion	
    WHERE p.id = (
        SELECT pe.id_producto 
        FROM producto_especifico as pe
        WHERE pe.id = ${productoId}
    )
    GROUP BY pe.id;
  `;

  try {
    const [rows] = await db.query(sql);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener las variaciones del produto:", error);
    return NextResponse.json(
      { error: "Error al obtener las variaciones del produto" },
      { status: 500 }
    );
  }
}
