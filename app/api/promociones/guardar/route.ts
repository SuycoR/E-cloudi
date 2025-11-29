// app/api/promociones/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // tu conexión mysql2 pool

interface PromocionRequest {
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  img_promocional?: string;
  porcentaje_descuento: number;
  nivel: number; // prioridad
  combinable: boolean;
  destino: {
    tipo: "CATEGORIA" | "PRODUCTO";
    ids: number[];
  };
  subcategorias?: number[];
}

export async function POST(request: Request) {
  console.log("🚀 API llamada recibida");

  try {
    const body: PromocionRequest = await request.json();
    console.log("📝 Body recibido:", JSON.stringify(body, null, 2));
    // Debug extra: tipos de los campos clave
    console.log("[DEBUG] typeof body.nivel:", typeof body.nivel, "valor:", body.nivel);
    console.log("[DEBUG] typeof body.combinable:", typeof body.combinable, "valor:", body.combinable);
    console.log("[DEBUG] typeof body.porcentaje_descuento:", typeof body.porcentaje_descuento, "valor:", body.porcentaje_descuento);
    console.log("[DEBUG] typeof body.destino:", typeof body.destino, "valor:", body.destino);
    if (body.destino) {
      console.log("[DEBUG] typeof body.destino.tipo:", typeof body.destino.tipo, "valor:", body.destino.tipo);
      console.log("[DEBUG] typeof body.destino.ids:", typeof body.destino.ids, "valor:", body.destino.ids);
    }

    // Validaciones básicas
    if (
      !body.nombre ||
      !body.descripcion ||
      !body.fecha_inicio ||
      !body.fecha_fin
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan campos requeridos: nombre, descripcion, fecha_inicio, fecha_fin",
        },
        { status: 400 }
      );
    }
    if (body.porcentaje_descuento <= 0 || body.porcentaje_descuento > 100) {
      return NextResponse.json(
        { error: "El porcentaje de descuento debe estar entre 1 y 100" },
        { status: 400 }
      );
    }

    // Validar fechas
    const fechaInicio = new Date(body.fecha_inicio);
    const fechaFin = new Date(body.fecha_fin);
    if (fechaInicio >= fechaFin) {
      return NextResponse.json(
        { error: "La fecha de inicio debe ser anterior a la fecha de fin" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();
    console.log("🔌 Conexión a BD obtenida");

    try {
      await connection.beginTransaction();
      console.log("🔄 Transacción iniciada");

      console.log("📦 Procesando promoción por productos");
      const { promocion_id, productos_afectados } =
        await aplicarPromocionPorProductos(connection, body);
      const resultData = { promocion_id, productos_afectados };

      await connection.commit();
      console.log("✅ Transacción confirmada");

      return NextResponse.json({
        success: true,
        message: "Promoción creada exitosamente",
        data: resultData,
      });
    } catch (err) {
      await connection.rollback();
      console.error("❌ Error en transacción, rollback:", err);
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creando promoción:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [promociones] = await db.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.fecha_inicio,
        p.fecha_final,
        p.img_promocional,
        COUNT(ppe.id_producto_especifico) as productos_count
      FROM promocion p
      LEFT JOIN promocion_producto_especifico ppe ON p.id = ppe.id_promocion
      WHERE p.fecha_final >= CURDATE()
      GROUP BY p.id, p.nombre, p.descripcion, p.fecha_inicio, p.fecha_final, p.img_promocional
      ORDER BY p.fecha_inicio DESC
    `);

    return NextResponse.json({
      success: true,
      data: promociones,
    });
  } catch (error) {
    console.error("Error obteniendo promociones:", error);
    return NextResponse.json(
      { error: "Error obteniendo promociones" },
      { status: 500 }
    );
  }
}

async function aplicarPromocionPorProductos(
  connection: any,
  body: PromocionRequest
) {
  const productoIds = body.destino.ids;
  if (productoIds.length === 0) {
    throw new Error("Debes seleccionar al menos un producto");
  }

  // Verificar existencia de productos específicos
  const placeholders = productoIds.map(() => "?").join(",");
  const [found] = await connection.execute(
    `SELECT id FROM producto_especifico WHERE id IN (${placeholders})`,
    productoIds
  );
  if ((found as any[]).length !== productoIds.length) {
    throw new Error("Algunos productos especificados no existen");
  }

  // Convertir a string CSV
  const idsString = productoIds.join(",");


  // Llamar al Stored Procedure AplicarPromocion_Productos (ahora con nivel y combinable)
  // IMPORTANTE: El SP debe aceptar los nuevos parámetros en el mismo orden
  const [[{ promocion_id, productos_afectados }]] = await connection.query(
    `CALL AplicarPromocion_Productos(
       ?, ?, ?, ?, ?, ?, ?, ?, ?
     )`,
    [
      body.nombre,
      body.descripcion,
      body.fecha_inicio,
      body.fecha_fin,
      body.img_promocional || null,
      idsString,
      body.porcentaje_descuento,
      body.nivel,
      body.combinable ? 1 : 0,
    ]
  );

  console.log(
    `✅ SP Productos devolvió promocion_id=${promocion_id}, productos_afectados=${productos_afectados}`
  );
  return { promocion_id, productos_afectados };
}
