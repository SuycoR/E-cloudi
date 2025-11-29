import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE() {
  try {
    const session = await auth();
    // Simulamos usuario autenticado con id = 1
    const userId = session?.user.id;

    // 1) Obtener el ID del carrito del usuario
    const [carritoRows] = await db.query(
      `SELECT id FROM carrito_compras WHERE id_usuario = ?`,
      [userId]
    );

    if ((carritoRows as any[]).length === 0) {
      return NextResponse.json(
        { error: "El usuario no tiene carrito" },
        { status: 400 }
      );
    }

    const carritoId = (carritoRows as any[])[0].id as number;

    // 2) Borrar todos los productos del carrito
    await db.query(
      `DELETE FROM carrito_compras_producto_especifico WHERE id_carrito = ?`,
      [carritoId]
    );

    return NextResponse.json({
      success: true,
      message: "Carrito vaciado con éxito",
    });
  } catch (error) {
    console.error("Error en DELETE /api/cart/DeleteAll:", error);
    return NextResponse.json(
      { error: "Error al vaciar el carrito" },
      { status: 500 }
    );
  }
}
