import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { productIds } = await req.json();

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: 'No se enviaron IDs' }, { status: 400 });
  }


  const results = await Promise.all(
    productIds.map(async (id: number) => {
      const [rows] = await db.query(
        'SELECT traer_descuento(?) AS descuento',
        [id]
      );
      const descuentoRows = rows as { descuento: number | null }[];
      return {
        id,
        descuento: descuentoRows[0]?.descuento ?? 0,
      };
    })
  );

  return NextResponse.json(results);
}
