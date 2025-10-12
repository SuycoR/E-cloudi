// app/api/direccion/set-default/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { usuario_id, direccion_id } = await req.json();

  if (
    typeof usuario_id !== "number" ||
    typeof direccion_id !== "number"
  ) {
    return NextResponse.json(
      { error: "usuario_id y direccion_id deben ser números." },
      { status: 400 }
    );
  }

  try {
    await db.query("CALL sp_set_dirreccion_predet(?, ?)", [
      usuario_id,
      direccion_id,
    ]);
    return NextResponse.json({
      message: "Dirección predeterminada actualizada.",
    });
  } catch (err) {
    console.error("Error al actualizar dirección:", err);
    return NextResponse.json(
      { error: "Error interno al actualizar la dirección." },
      { status: 500 }
    );
  }
}
