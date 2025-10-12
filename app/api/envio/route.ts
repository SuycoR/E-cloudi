import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// API: /api/envio?direccionId=...
export async function GET(req: NextRequest) {
  const direccionId = req.nextUrl.searchParams.get('direccionId');
  if (!direccionId) {
    return NextResponse.json({ error: 'Falta el parámetro direccionId' }, { status: 400 });
  }

  try {
    // Llama a la función almacenada en MySQL solo con direccionId
    const [rows] = await db.execute(
      'SELECT fn_calcular_costo_envio(?) as costo',
      [direccionId]
    );
    const data = rows as { costo: number }[];
    return NextResponse.json({ costoEnvio: data[0]?.costo });
  } catch {
    return NextResponse.json({ error: 'Error al calcular el costo de envío' }, { status: 500 });
  }
}
