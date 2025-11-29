// app/api/admin/productos/[id]/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idProducto = parseInt(id, 10);
  if (isNaN(idProducto)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { productoGeneral, productosEspecificos } = body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Actualizar producto general
    await connection.query(
      `UPDATE producto
       SET nombre = ?, descripcion = ?, imagen_producto = ?
       WHERE id = ?`,
      [productoGeneral.nombre, productoGeneral.descripcion, productoGeneral.imagen_producto, idProducto]
    );

    // Actualizar categorías si es necesario
    /*await connection.query(
      `UPDATE producto_categoria
       SET id_cat_n1 = ?, id_cat_n2 = ?, id_cat_n3 = ?
       WHERE id_producto = ?`,
      [
        productoGeneral.categoria1 || null,
        productoGeneral.categoria2 || null,
        productoGeneral.categoria3 || null,
        idProducto
      ]
    );*/

    // Actualizar productos específicos
    for (const esp of productosEspecificos) {
      await connection.query(
        `UPDATE producto_especifico
         SET SKU = ?, cantidad_stock = ?, imagen_producto = ?, precio = ?
         WHERE id = ? AND id_producto = ?`,
        [esp.SKU, esp.cantidad_stock, esp.imagen_producto, esp.precio, esp.id_especifico, idProducto]
      );
    }

    await connection.commit();
    connection.release();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
