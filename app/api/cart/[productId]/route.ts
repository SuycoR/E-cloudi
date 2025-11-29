import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * Definimos una interfaz explícita para el contexto que recibimos.
 * No destructuramos { params } en la firma; recibimos un objeto `context`
 * y luego extraemos `params` dentro de la función.
 */
interface Context {
  params: Promise<{ productId: string }>;
}

/**
 * DELETE /api/cart/{productId}
 * Elimina ese producto específico del carrito del usuario.
 */
export async function DELETE(
  request: Request,
  context: Context
) {
  const session = await auth();
  try {
    // Extraemos params haciendo await sobre context.params
    const paramsData = await context.params;
    const productId = parseInt(paramsData.productId, 10);

    // Simulamos usuario autenticado con id 
    const userId = session?.user.id;

    // 1) Obtener el id del carrito para userId 
    const [carritoRows] = await db.query(
      `SELECT id FROM carrito_compras WHERE id_usuario = ?`,
      [userId]
    );
    if ((carritoRows as any[]).length === 0) {
      return NextResponse.json(
        { error: 'El usuario no tiene carrito' },
        { status: 400 }
      );
    }
    const carritoId = (carritoRows as any[])[0].id as number;

    // 2) Borrar la línea en carrito_compras_producto_especifico
    await db.query(
      `DELETE FROM carrito_compras_producto_especifico 
       WHERE id_carrito = ? AND id_producto_especifico = ?`,
      [carritoId, productId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/cart/[productId]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar ítem del carrito' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context
) {
  const session = await auth();
  try {
    const paramsData = await context.params;
    const productId = parseInt(paramsData.productId, 10);
    const { quantity } = await request.json();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser un número mayor o igual a 1' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // 1. Verificar existencia del producto y su stock
    const [stockRows] = await db.query(
      `SELECT Cantidad_stock FROM producto_especifico WHERE id = ?`,
      [productId]
    );

    const stockRowArray = stockRows as any[];
    if (stockRowArray.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const stockDisponible = stockRowArray[0].Cantidad_stock as number;

    if (stockDisponible === 0) {
      return NextResponse.json({ error: 'NO HAY STOCK DISPONIBLE' }, { status: 400 });
    }

    if (quantity > stockDisponible) {
      return NextResponse.json(
        { error: `Solo hay ${stockDisponible} unidades disponibles` },
        { status: 400 }
      );
    }

    // 2. Obtener carrito del usuario
    const [carritoRows] = await db.query(
      `SELECT id FROM carrito_compras WHERE id_usuario = ?`,
      [userId]
    );

    const carritoRowArray = carritoRows as any[];
    if (carritoRowArray.length === 0) {
      return NextResponse.json({ error: 'El usuario no tiene carrito' }, { status: 400 });
    }

    const carritoId = carritoRowArray[0].id as number;

    // 3. Verificar que el producto esté en el carrito
    const [productoRows] = await db.query(
      `SELECT cantidad FROM carrito_compras_producto_especifico
       WHERE id_carrito = ? AND id_producto_especifico = ?`,
      [carritoId, productId]
    );

    if ((productoRows as any[]).length === 0) {
      return NextResponse.json(
        { error: 'El producto no está en el carrito' },
        { status: 404 }
      );
    }

    // 4. Actualizar cantidad
    await db.query(
      `UPDATE carrito_compras_producto_especifico
       SET cantidad = ?
       WHERE id_carrito = ? AND id_producto_especifico = ?`,
      [quantity, carritoId, productId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en PATCH /api/cart/[productId]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar cantidad del carrito' },
      { status: 500 }
    );
  }
}
