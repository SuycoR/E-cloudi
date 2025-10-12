import { NextResponse } from "next/server";
import { db } from "@/lib/db";  // tu conexión mysql2 pool

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productoGeneral, productosEspecificos } = body;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        'CALL GuardarProducto(?, ?, ?, ?, ?, ?, ?, @nuevo_id);',
        [
            productoGeneral.nombre,
            productoGeneral.descripcion,
            productoGeneral.imagen_producto,
            productoGeneral.categoria1,
            productoGeneral.categoria2 && productoGeneral.categoria2 !== '' ? Number(productoGeneral.categoria2) : null,
            productoGeneral.categoria3 && productoGeneral.categoria3 !== '' ? Number(productoGeneral.categoria3) : null,
            productoGeneral.marca,
        ]
        );

        const [rows]: any = await connection.query('SELECT @nuevo_id as id;');
        const idProducto = rows[0].id;

      // Ahora insertar los productos específicos junto con sus variaciones en formato JSON
      for (const prodEspec of productosEspecificos) {
        // Aquí asumimos que prodEspec tiene un arreglo "variaciones" con objetos { id_variacion_opcion: number }
        await connection.query(
          'CALL GuardarProductoEspecificoConVariaciones(?, ?, ?, ?, ?, ?)',
          [
            idProducto,
            prodEspec.sku,
            prodEspec.precio,
            prodEspec.stock,
            prodEspec.imagen,
            JSON.stringify(prodEspec.variaciones || []),  // convertimos las variaciones a JSON string
          ]
        );
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({ success: true, idProducto });
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error(err);
      return NextResponse.json({ success: false, message: "Error en la transacción" }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error en el servidor" }, { status: 500 });
  }
}
