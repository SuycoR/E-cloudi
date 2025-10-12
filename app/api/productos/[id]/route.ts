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
      pe.SKU,
      pe.cantidad_stock,
      pe.imagen_producto,
      pe.precio,
      p.nombre,
      p.descripcion,
      m.nombre         AS marca,
      m.imagen_logo   AS logo,
      JSON_OBJECTAGG(v.nombre, vo.valor) AS especificaciones,
      c3.nombre_categoria AS nivel_3,
      c2.nombre_categoria AS nivel_2,
      c1.nombre_categoria AS nivel_1,
      pcat.id_cat_n1 AS id_cat_n1,
      pcat.id_cat_n2 AS id_cat_n2,
      pcat.id_cat_n3 AS id_cat_n3,
      ppe.porcentaje_desc AS descuento,
      pro.nombre          AS nombre_promocion
    FROM producto_especifico AS pe
    JOIN producto AS p
      ON p.id = pe.id_producto
    LEFT JOIN producto_categoria as pcat
	ON pcat.id_producto = p.id
    LEFT JOIN categoria_nivel_1 AS c1
      ON pcat.id_cat_n1 = c1.id
      LEFT JOIN categoria_nivel_2 AS c2
      ON pcat.id_cat_n2 = c2.id
    LEFT JOIN categoria_nivel_3 AS c3
      ON pcat.id_cat_n3 = c3.id
    LEFT JOIN marcas AS m
      ON p.marca = m.id
    LEFT JOIN combinaciones_producto AS cp
      ON pe.id = cp.id_producto_especifico
    LEFT JOIN variacion_opcion AS vo
      ON cp.id_variacion_opcion = vo.id
    LEFT JOIN variacion AS v
      ON v.id = vo.id_variacion
	
    LEFT JOIN promocion_producto_especifico AS ppe
      ON ppe.id_producto_especifico = pe.id
    LEFT JOIN promocion AS pro
      ON pro.id = ppe.id_promocion
		WHERE pe.id = ${productoId} 
    GROUP BY 
    pe.id,
    pe.SKU,
    pe.cantidad_stock,
    pe.imagen_producto,
    pe.precio,
    p.nombre,
    p.descripcion,
    m.nombre,
    m.imagen_logo,
    c3.nombre_categoria,
    c2.nombre_categoria,
    c1.nombre_categoria,
    pcat.id_cat_n1,
    pcat.id_cat_n2,
    pcat.id_cat_n3,
    ppe.porcentaje_desc,
    pro.nombre
    ;
  `;

  try {
    const [rows] = await db.query(sql);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}
