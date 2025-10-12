import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 
import { RowDataPacket } from "mysql2";

interface VariacionRow extends RowDataPacket {
  id: number;
  nombre: string;
  id_categoria_1: number;
  id_categoria_2: number | null;
  id_categoria_3: number | null;
}

// Para traer todas las variaciones UNICAMENTE de los niveles e id's especificados.
// 19/06 - No se llega a utilizar esta API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const id_categoria_1 = Number(searchParams.get("id_categoria_1"));
    const id_categoria_2 = searchParams.get("id_categoria_2");
    const id_categoria_3 = searchParams.get("id_categoria_3");

    if (!id_categoria_1) {
      return NextResponse.json(
        { error: "Falta id_categoria_1" },
        { status: 400 }
      );
    }

    // Convertir id_categoria_2 y 3 a number o null si no vienen o son 'null'
    const cat2 = id_categoria_2 && id_categoria_2 !== "null" ? Number(id_categoria_2) : null;
    const cat3 = id_categoria_3 && id_categoria_3 !== "null" ? Number(id_categoria_3) : null;

    // Construcción dinámica de la consulta
    const query = `
      SELECT id, nombre, id_categoria_1, id_categoria_2, id_categoria_3
      FROM variacion
      WHERE
        (id_categoria_1 = ? AND id_categoria_2 = ? AND id_categoria_3 = ?)
        OR (id_categoria_1 = ? AND id_categoria_2 = ? AND id_categoria_3 IS NULL)
        OR (id_categoria_1 = ? AND id_categoria_2 IS NULL AND id_categoria_3 IS NULL)
    `;

    // Parámetros en orden según el query
    const params = [id_categoria_1, cat2, cat3, id_categoria_1, cat2, id_categoria_1];

    const [rows] = await db.query<VariacionRow[]>(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching variaciones:", error);
    return NextResponse.json(
      { error: "Error fetching variaciones" },
      { status: 500 }
    );
  }
}
