// app/api/productos/especificos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const precioMinimo = params.get("precioMinimo") ?? "";
  const precioMaximo = params.get("precioMaximo") ?? "";
  const fechaDesde = params.get("fechaDesde") ?? "";
  const fechaHasta = params.get("fechaHasta") ?? "";
  const stockMinimo = params.get("stockMinimo") ?? "";
  const stockMaximo = params.get("stockMaximo") ?? "";
  const subIdsParam = params.get("subcategoriaIds") ?? "";
  const subcategoriaIds = subIdsParam
    ? subIdsParam.split(",").map((id) => Number(id))
    : [];

  // 1️⃣ Base del SELECT
  let sql = `
    SELECT
      pe.id,
      p.nombre,
      pe.SKU,
      pe.precio,
      pe.cantidad_stock AS stock,
      pe.imagen_producto AS imagen,
      pe.fecha_registro
    FROM Ecommerce.producto_especifico pe
    INNER JOIN Ecommerce.producto p ON p.id = pe.id_producto
  `;

  const wheres: string[] = [];

  // 2️⃣ JOIN y filtro por subcategorías (nivel 2)
  if (subcategoriaIds.length > 0) {
    sql += `
      INNER JOIN Ecommerce.producto_categoria pc ON p.id = pc.id_producto
    `;
    wheres.push(`pc.id_cat_n2 IN (${subcategoriaIds.join(",")})`);
  }

  // 3️⃣ Filtros de precio (numéricos, sin comillas)
  if (precioMinimo) {
    wheres.push(`pe.precio >= ${precioMinimo}`);
  }
  if (precioMaximo) {
    wheres.push(`pe.precio <= ${precioMaximo}`);
  }

  // 4️⃣ Filtros de stock (numéricos, sin comillas)
  if (stockMinimo) {
    wheres.push(`pe.cantidad_stock >= ${stockMinimo}`);
  }
  if (stockMaximo) {
    wheres.push(`pe.cantidad_stock <= ${stockMaximo}`);
  }

  // 5️⃣ Filtros de fecha (entre comillas) — opcional, descomenta si los usas
  
  if (fechaDesde) {
    wheres.push(`pe.fecha_registro >= '${fechaDesde}'`);
  }
  if (fechaHasta) {
    wheres.push(`pe.fecha_registro <= '${fechaHasta}'`);
  }
  

  // 6️⃣ Montar el WHERE si hay condiciones
  if (wheres.length) {
    sql += `\nWHERE ` + wheres.join(" AND ");
  }

  try {
    // 7️⃣ Ejecutar la consulta
    console.log("SQL Filtrado:", sql);
    const [rows] = await db.query<any[]>(sql);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error filtrando productos:", error);
    return NextResponse.json(
      { error: "Error al filtrar productos" },
      { status: 500 }
    );
  } 
}
