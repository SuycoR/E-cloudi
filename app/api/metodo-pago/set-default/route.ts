import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  // 1) Leer y parsear body
  const body = await req.json();
  const usuario_id = parseInt(body.usuario_id, 10);
  const metodo_pago_id = parseInt(body.metodo_pago_id, 10);

  // 2) Validación de entrada
  if (isNaN(usuario_id) || isNaN(metodo_pago_id)) {
    return NextResponse.json(
      { error: "usuario_id y metodo_pago_id deben ser números válidos." },
      { status: 400 }
    );
  }

  try {
    // 3) Llamada al SP para setear método de pago predeterminado
    await db.query("CALL sp_set_metodo_pago_predet(?, ?)", [
      usuario_id,
      metodo_pago_id,
    ]);
    return NextResponse.json({
      message: "Método de pago predeterminado actualizado.",
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno al actualizar el método de pago." },
      { status: 500 }
    );
  }
}
