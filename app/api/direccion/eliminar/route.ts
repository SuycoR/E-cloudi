import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  try {
    const { direccion_id, usuario_id } = await req.json();

    const [rows]: any = await db.query(
      `CALL EliminarDireccionUsuario(?, ?, @resultado);`,
      [direccion_id, usuario_id]
    );

    // Alternativa sin SELECT, puedes enviar OK directamente si no se lanza error
    return NextResponse.json({ message: "Dirección eliminada correctamente" }, { status: 200 });

  } catch (error: any) {
    console.error("Error eliminando dirección:", error);
    return NextResponse.json({ error: "Error del servidor al eliminar" }, { status: 500 });
  }
}
