// app/api/ubicaciones/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [departamentos] = await db.execute("SELECT * FROM departamento");
    const [provincias] = await db.execute("SELECT * FROM provincias");
    const [distritos] = await db.execute("SELECT * FROM distrito");

    const resultado = (departamentos as any[]).map(dep => {
      const provs = (provincias as any[]).filter(p => p.departamento_id === dep.id).map(prov => {
        const dists = (distritos as any[]).filter(d => d.id_provincia === prov.id);
        return { ...prov, distritos: dists };
      });
      return { ...dep, provincias: provs };
    });

    return NextResponse.json({ departamentos: resultado });
  } catch (error) {
    console.error("Error al obtener ubicaciones", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
