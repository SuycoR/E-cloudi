// app/api/cart/addOrUpdate/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { productId, cantidad } = await req.json();

    const userId = session?.user.id;

    // 1. Obtener stock actual del producto
    const [stockRows] = await db.query(
      `SELECT Cantidad_stock FROM producto_especifico WHERE id = ?`,
      [productId]
    );

    if ((stockRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const stockDisponible = (stockRows as any[])[0].Cantidad_stock as number;

    // 2. Verificar si hay stock disponible
    if (stockDisponible === 0) {
      return NextResponse.json({ error: "NO HAY STOCK" }, { status: 400 });
    }

    // 3. Obtener o crear carrito del usuario
    const [carritoRows] = await db.query(
      `SELECT id FROM carrito_compras WHERE id_usuario = ?`,
      [userId]
    );

    if ((carritoRows as any[]).length === 0) {
      const [insertResult] = await db.query(
        `INSERT INTO carrito_compras (id_usuario) VALUES (?)`,
        [userId]
      );
      // @ts-expect-error - carritoRows is defined above
      carritoRows.push({ id: (insertResult as any).insertId });
    }

    const carritoId = (carritoRows as any[])[0].id as number;

    // 4. Verificar si el producto ya está en el carrito
    const [existingRows] = await db.query(
      `SELECT cantidad FROM carrito_compras_producto_especifico
       WHERE id_carrito = ? AND id_producto_especifico = ?`,
      [carritoId, productId]
    );

    const cantidadActual = (existingRows as any[])[0]?.cantidad || 0;
    const nuevaCantidad = cantidadActual + cantidad;

    // 5. Validar que no se supere el stock
    if (nuevaCantidad > stockDisponible) {
      return NextResponse.json(
        {
          error: `No puedes agregar más de ${stockDisponible} unidades de este producto.`,
        },
        { status: 400 }
      );
    }

    // 6. Insertar o actualizar la cantidad en el carrito
    if ((existingRows as any[]).length > 0) {
      await db.query(
        `UPDATE carrito_compras_producto_especifico
         SET cantidad = ?
         WHERE id_carrito = ? AND id_producto_especifico = ?`,
        [nuevaCantidad, carritoId, productId]
      );
    } else {
      await db.query(
        `INSERT INTO carrito_compras_producto_especifico
         (id_carrito, id_producto_especifico, cantidad)
         VALUES (?, ?, ?)`,
        [carritoId, productId, cantidad]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error en POST /api/cart/addOrUpdate:", err);
    return NextResponse.json(
      { error: "Error al agregar/actualizar ítem en el carrito" },
      { status: 500 }
    );
  }
}
