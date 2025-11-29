import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idProductoEspecifico = parseInt(id, 10);

  if (isNaN(idProductoEspecifico)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // Verificar si el producto ya está deshabilitado
    const [checkRows] = await db.query(
      "SELECT id FROM producto_especifico WHERE id = ? AND estado = 'deshabilitado'",
      [idProductoEspecifico]
    );

    if (Array.isArray(checkRows) && checkRows.length > 0) {
      return NextResponse.json(
        { message: "El producto ya está deshabilitado" },
        { status: 200 }
      );
    }

    // Llamar al procedimiento almacenado 'disableProduct'
    await db.query("CALL disableProduct(?)", [idProductoEspecifico]);

    // Verificar si el producto quedó deshabilitado
    const [rows] = await db.query(
      "SELECT id FROM producto_especifico WHERE id = ? AND estado = 'deshabilitado'",
      [idProductoEspecifico]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Producto específico no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Producto deshabilitado",
    });
  } catch (err) {
    console.error("Error al deshabilitar producto específico:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
