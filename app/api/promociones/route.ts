import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, descripcion, fecha_inicio, fecha_final, img_promocional 
       FROM ecommerce.promocion
       WHERE fecha_inicio <= NOW()
       AND fecha_final >= NOW()
       ;`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    return NextResponse.json({ error: 'Error al obtener promociones' }, { status: 500 });
  }
}
