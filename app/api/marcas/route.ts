import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Ajusta ruta si es necesario
import { RowDataPacket } from "mysql2";

interface MarcaRow extends RowDataPacket {
  id: number;
  nombre: string;
  imagen_logo: string;
}

export async function GET() {
  try {
    const [rows] = await db.query<MarcaRow[]>(
      "SELECT id, nombre, imagen_logo FROM ecommerce.marcas"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching marcas:", error);
    return NextResponse.json(
      { error: "Error fetching marcas" },
      { status: 500 }
    );
  }
}
