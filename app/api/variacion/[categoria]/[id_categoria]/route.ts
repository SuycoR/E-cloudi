// /app/api/variacion/[categoria]/[id_categoria]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { Categoria } from "@/app/types/valorVariacion";

type Data = RowDataPacket & {
  nombre_categoria: string;
  id_variacion: number;
  nombre_variacion: string;
  id_opcion: number;
  valor_opcion: string;
};

// Trae todas las variaciones asociadas a una categoria, unica y exclusivamente
// de esa categoria.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoria: string; id_categoria: string }> }
) {
  const { categoria: categoriaStr, id_categoria: idCategoriaStr } =
    await params;
  const categoria = parseInt(categoriaStr);
  const id_categoria = parseInt(idCategoriaStr);

  // Validamos que `categoria` sea 1, 2 o 3
  if (![1, 2, 3].includes(categoria)) {
    return NextResponse.json(
      { error: "El parámetro categoría debe ser 1, 2 o 3." },
      { status: 400 }
    );
  }

  try {
    // Construcción de la consulta SQL dinámica
    let query = `
      SELECT 
        cn.id AS id_categoria,
        cn.nombre_categoria,
        v.id AS id_variacion,
        v.nombre AS nombre_variacion,
        vo.id AS id_opcion,
        vo.valor AS valor_opcion
      FROM variacion v
      JOIN variacion_opcion vo ON v.id = vo.id_variacion
      JOIN categoria_nivel_${categoria} cn ON cn.id = v.id_categoria_${categoria}
      WHERE v.id_categoria_${categoria} = ?`;

    // Añadimos la comprobación de NULL solo si no es el último nivel (cuando input=3 no debe comprobar id_categoria_4)
    if (categoria < 3) {
      query += ` AND v.id_categoria_${categoria + 1} IS NULL`;
    }

    const [rows] = await db.query<Data[]>(query, [id_categoria]);

    // Agrupamos los datos por categoría y variación
    const categorias: Categoria[] = [];

    rows.forEach((row) => {
      let categoria = categorias.find(
        (cat) => cat.nombre_categoria === row.nombre_categoria
      );
      if (!categoria) {
        categoria = {
          id_categoria: row.id_categoria,
          nombre_categoria: row.nombre_categoria,
          variaciones: [],
        };
        categorias.push(categoria);
      }

      let variacion = categoria.variaciones.find(
        (v) => v.id_variacion === row.id_variacion
      );
      if (!variacion) {
        variacion = {
          id_variacion: row.id_variacion,
          nombre_variacion: row.nombre_variacion,
          valores: [],
        };
        categoria.variaciones.push(variacion);
      }

      variacion.valores.push({
        id_valor: row.id_opcion,
        nombre_valor: row.valor_opcion,
      });
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error fetching variaciones:", error);
    return NextResponse.json(
      { error: "Error fetching variaciones" },
      { status: 500 }
    );
  }
}
