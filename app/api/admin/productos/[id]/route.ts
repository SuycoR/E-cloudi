// app/api/admin/productos/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idProducto = parseInt(id, 10);
  if (isNaN(idProducto)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // Consulta para productos generales
    const [prodRows] = await db.query<RowDataPacket[]>(
      `SELECT id, nombre, descripcion, imagen_producto, id_cat_n1, id_cat_n2, id_cat_n3, p.marca
       FROM producto_categoria AS pc
       JOIN producto AS p ON p.id = pc.id_producto
       WHERE p.id = ? LIMIT 1`,
      [idProducto]
    );
    if (prodRows.length === 0) {
      return NextResponse.json({ error: "Producto no existe" }, { status: 404 });
    }
    const prod = prodRows[0];

    // Productos específicos con variaciones
    const [espRows] = await db.query<RowDataPacket[]>(
      `SELECT pe.id AS id_especifico, pe.SKU, pe.precio, pe.cantidad_stock AS stock, pe.imagen_producto AS imagen
       FROM producto_especifico AS pe
       WHERE pe.id_producto = ?`,
      [idProducto]
    );

    // Variaciones por cada específico
    const variacionesPorEspecifico: Record<number, RowDataPacket[]> = {};
    for (const pe of espRows) {
      const [vos] = await db.query<RowDataPacket[]>(
        `SELECT vo.id AS id_variacion_opcion, vo.valor, v.id AS id_variacion, v.nombre AS tipo
         FROM combinaciones_producto AS cp
         JOIN variacion_opcion AS vo ON cp.id_variacion_opcion = vo.id
         JOIN variacion AS v ON vo.id_variacion = v.id
         WHERE cp.id_producto_especifico = ?`,
        [pe.id_especifico]
      );
      variacionesPorEspecifico[pe.id_especifico] = vos;
    }

    const response = {
      productoGeneral: {
        id: prod.id,
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        imagen_producto: prod.imagen_producto,
        categoria1: prod.id_cat_n1,
        categoria2: prod.id_cat_n2,
        categoria3: prod.id_cat_n3,
        marca: prod.marca,
      },
      productosEspecificos: espRows.map(pe => ({
        ...pe,
        variaciones: variacionesPorEspecifico[pe.id_especifico] || [],
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error en API editar producto:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
