import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Ajusta la ruta según tu proyecto
import { RowDataPacket } from "mysql2";

interface ValorVariacionRow extends RowDataPacket {
  id: number;
  valor: string;
  id_variacion: number;
}
// localhost:3000/
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_variacion = searchParams.get("id_variacion");

    if (!id_variacion) {
      return NextResponse.json(
        { error: "El parámetro id_variacion es requerido" },
        { status: 400 }
      );
    }

    const query = `
      SELECT id, valor, id_variacion
      FROM variacion_opcion
      WHERE id_variacion = ?
    `;

    const [rows] = await db.query<ValorVariacionRow[]>(query, [id_variacion]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching valores de variación:", error);
    return NextResponse.json(
      { error: "Error fetching valores de variación" },
      { status: 500 }
    );
  }
}