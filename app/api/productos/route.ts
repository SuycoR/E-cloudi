import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const onlyPromo = params.get("onlyPromo") ?? "";
  const promocionId = params.get("promocionId") ?? "";
  const minPrecio = params.get("minPrecio") ?? "";
  const maxPrecio = params.get("maxPrecio") ?? "";
  const limit = params.get("limit") ?? "";
  const categoryId = params.get("categoryId") ?? "";
  const categoryLevel = params.get("categoryLevel") ?? "";
  const variationParam = params.get("variationIds") ?? ""; // 
  const selectedVariations = variationParam
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "");

  if (selectedVariations.length > 0 && (minPrecio || maxPrecio)) {
    console.log("⚡ Ignorando consulta: variaciones y precios no se pueden combinar.");
    return NextResponse.json({ products: [] });
  }
    // Si hay variaciones seleccionadas, se realiza la consulta para esas variaciones.
  if (selectedVariations.length > 0 ) {
    console.log("usando API con variaciones")
    return await fetchProductsWithVariations(selectedVariations,
      categoryId,
      categoryLevel,

      limit);
  }
  else {
    // Si no se seleccionaron variaciones, se realizan las otras opciones
    console.log("usando API sin variaciones")
    return await fetchProductsWithoutVariations(categoryId,
      categoryLevel,
      limit,
      onlyPromo,
      promocionId,
      minPrecio,
      maxPrecio);

  }


}
async function fetchProductsWithVariations(selectedVariations: string[],
  categoryId: string,
  categoryLevel: string,

  limit: string) {
  try {
    const sql = `
      SELECT DISTINCT
        pe.id as id_producto_especifico,
        pe.SKU,
        pe.precio,
        pe.imagen_producto,
        p.descripcion,
        p.id as producto_id,
        p.nombre,
        MAX(ppe.porcentaje_desc) as porcentaje_desc,
        COUNT(DISTINCT vo.id) as matched_variations
      FROM variacion v
      JOIN categoria_nivel_${categoryLevel} cn ON cn.id = v.id_categoria_${categoryLevel}
      JOIN variacion_opcion vo ON v.id = vo.id_variacion
      JOIN combinaciones_producto cp ON cp.id_variacion_opcion = vo.id
      JOIN producto_especifico pe ON pe.id = cp.id_producto_especifico
      LEFT JOIN promocion_producto_especifico ppe ON ppe.id_producto_especifico = pe.id 
      JOIN producto p ON pe.id_producto = p.id
      WHERE v.id_categoria_${categoryLevel} = ?
      AND vo.id IN (${selectedVariations.map(() => '?').join(',')})
      GROUP BY 
        pe.id, 
        pe.SKU, 
        pe.precio, 
        pe.imagen_producto, 
       p.descripcion, 
       p.id, 
       p.nombre
      HAVING COUNT(DISTINCT vo.id) = ?
      LIMIT ?;
    `;

    const params: (string | number)[] = [
      categoryId,
      ...selectedVariations,
      selectedVariations.length,
      parseInt(limit, 10) || 20,
    ];
    console.log("SQL Query:", categoryId, selectedVariations, params);
    //Se ejecuta la consulta
    const [rows] = await db.query(sql, params);
    console.log("Rows fetched:", rows);
    return NextResponse.json({ products: rows });

  } catch (error) {
    console.error("Error al obtener productos con variaciones:", error);
    return NextResponse.json({ error: "Error al obtener productos con variaciones" }, { status: 500 });
  }
}
async function fetchProductsWithoutVariations(categoryId: string,
  categoryLevel: string,
  limit: string,
  onlyPromo: string,
  promocionId: string,
  minPrecio: string,
  maxPrecio: string) {
  // Si queremos productos que tengan alguna promoción o no
  const joinPromo =
    onlyPromo === "true"
      ? "INNER JOIN Ecommerce.promocion_producto_especifico AS ppe ON pe.id = ppe.id_producto_especifico"
      : "LEFT JOIN Ecommerce.promocion_producto_especifico AS ppe ON pe.id = ppe.id_producto_especifico";

  // Si se nos especifica el límite de productos a devolver
  const limitSentence = limit
    ? `\nORDER BY p.id \nLIMIT ${parseInt(limit)}`
    : "";

  const catId = parseInt(categoryId);
  const catLevel = parseInt(categoryLevel);

  // Join para validar si la promoción está vigente
  const joinPromocion = "LEFT JOIN Ecommerce.promocion AS pr ON pr.id = ppe.id_promocion";

  // Si se nos especifica el nivel de categoría y el id de la categoría
  const joinCategory =
    "INNER JOIN producto_categoria as pc ON p.id = pc.id_producto";

  // La query
  let sql = `
    WITH max_precios AS (
      SELECT 
        id_producto, 
        MIN(precio) AS precio_max
      FROM Ecommerce.producto_especifico
      GROUP BY id_producto
    )

    SELECT DISTINCT
      p.id  AS producto_id,
      pe.id AS id_producto_especifico,
      p.nombre,
      p.descripcion,
      pe.imagen_producto,
      pe.precio,               -- aquí es el precio máximo
      traer_descuento(pe.id) AS porcentaje_desc

    FROM Ecommerce.producto AS p
    INNER JOIN Ecommerce.producto_especifico AS pe 
    ON p.id = pe.id_producto
    INNER JOIN max_precios AS mp
    ON pe.id_producto = mp.id_producto
    AND pe.precio       = mp.precio_max

    ${joinPromo}
    ${joinPromocion}

    ${!isNaN(catLevel) && !isNaN(catId) ? `\n${joinCategory}` : ""} 
      
    WHERE pe.id = (
      SELECT MIN(ID) 
      FROM Ecommerce.producto_especifico
      WHERE id_producto = mp.id_producto
      AND precio = mp.precio_max
      )

   `;

  // Añadimos filtros
  const conditions: string[] = [];
  if (promocionId) {
    conditions.push(`ppe.id_promocion = ${db.escape(parseInt(promocionId))}`);
  }
  if (minPrecio) {
    conditions.push(`pe.precio          >= ${db.escape(minPrecio)}`);
  }
  if (maxPrecio) {
    conditions.push(`pe.precio          <= ${db.escape(maxPrecio)}`);
  }
  if (!isNaN(catLevel) && !isNaN(catId)) {
    conditions.push(
      `pc.id_cat_n${categoryLevel} = ${db.escape(parseInt(categoryId))}`
    );
  }
  if (onlyPromo === "true") {
    conditions.push(`CURRENT_DATE() BETWEEN pr.fecha_inicio AND pr.fecha_final`);
  }
  if (conditions.length > 0) {
    sql += `\nAND ${conditions.join(" AND ")}`;
  }

  sql += limitSentence;

  try {
    const [rows] = await db.query(sql);
    // Query para min y max
    const sqlMinMax = `
  SELECT 
    MIN(pe.precio) AS minPrecio,
    MAX(pe.precio) AS maxPrecio
  FROM Ecommerce.producto AS p
  INNER JOIN Ecommerce.producto_especifico AS pe 
    ON p.id = pe.id_producto
  ${joinPromo}
  ${joinPromocion}
  ${!isNaN(catLevel) && !isNaN(catId) ? `\n${joinCategory}` : ""} 
  WHERE 1 = 1
  ${conditions.length > 0 ? `\nAND ${conditions.join(" AND ")}` : ""}
`;
    const result = await db.query(sqlMinMax);
    const priceRows = result[0] as any[];
    const { minPrecio, maxPrecio } = priceRows[0];

    return NextResponse.json({ products:rows, minPrecio, maxPrecio });
  } catch (error) {
    console.error("Error al obtener productos sin variacion:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }

}


