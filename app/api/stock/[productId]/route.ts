import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  // Indica que params es una promesa de un objeto con productId
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Esperamos a que params se resuelva
    const { productId } = await params;

    const parsedId = parseInt(productId, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `SELECT Cantidad_stock FROM producto_especifico WHERE id = ?`,
      [parsedId]
    );

    const result = rows as any[];

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      Cantidad_stock: result[0].Cantidad_stock,
    });
  } catch (err) {
    console.error('Error al obtener stock:', err);
    return NextResponse.json(
      { error: 'Error del servidor al consultar stock' },
      { status: 500 }
    );
  }
}
