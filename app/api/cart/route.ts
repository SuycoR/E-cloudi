// app/api/cart/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Usamos tu helper `db` en lugar de `pool`
import { auth } from '../auth/[...nextauth]/route';

export async function GET() {
  //Traemos la session actual, tiene formato JSON
  const session = await auth();
  
  try {
    
    // con el ID real extraído de la sesión/autenticación.
    const userId = session?.user.id;

    // Query SQL original adaptada para incluir productId (pe.id)
    const query = `
      SELECT
        pe.id          AS productId,
        p.nombre,
        p.descripcion,
        pe.imagen_producto,
        cp.cantidad,
        pe.precio
      FROM carrito_compras c
      JOIN carrito_compras_producto_especifico cp
        ON c.id = cp.id_carrito
      JOIN producto_especifico pe
        ON cp.id_producto_especifico = pe.id
      JOIN producto p
        ON pe.id_producto = p.id
      WHERE c.id_usuario = ?
    `;

    // En lugar de pool.query, hacemos db.query(query, [userId])
    const [rows] = await db.query(query, [userId]);
    // `rows` vendrá tipado como RowDataPacket[], lo convertimos a CartItem[]
    const cartItems = (rows as any[]).map((item) => ({
      productId: item.productId as number,
      nombre: item.nombre as string,
      descripcion: item.descripcion as string,
      image_producto: item.imagen_producto as string,
      cantidad: item.cantidad as number,
      precio: item.precio as number,
    }));

    return NextResponse.json({ items: cartItems });
  } catch (error: any) {
    console.error('Error en GET /api/cart:', error);
    return NextResponse.json(
      { error: 'Error al obtener los ítems del carrito' },
      { status: 500 }
    );
  }
}
