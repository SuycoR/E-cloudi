import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface ResultadoRow extends RowDataPacket {
  resultado: string; // Tu SP retorna JSON como string
}

// Se utiliza para carga el contenido al Drawer
export async function GET() {
  try {
    const [rows] = await db.query<ResultadoRow[]>(
      "CALL obtenerCategoriasAnidadas()",
      []
    );    
    console.log(rows);
    const categorias = rows[0][0]?.categorias_json;
    // Si ya es objeto, úsalo tal cual
    const data = typeof categorias === "string"
      ? JSON.parse(categorias)
      : categorias ?? [];

    console.log(data);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    );
  }
}
