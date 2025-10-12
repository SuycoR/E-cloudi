
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface TipoPagoRow extends RowDataPacket {
  id: number;
  valor: string;
}

export async function GET() {
  try {
    const [rows] = await db.query<TipoPagoRow[]>(
      `SELECT id, valor 
         FROM Ecommerce.tipo_pago`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching tipos de pago:", error);
    return NextResponse.json(
      { error: "Error fetching tipos de pago" },
      { status: 500 }
    );
  }
}
