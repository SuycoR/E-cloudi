// app/api/productos/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { fetchProductDetailById } from "@/lib/products";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    const rows = await fetchProductDetailById(productId);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}
