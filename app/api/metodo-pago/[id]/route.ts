import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MetodoPagoRow } from "@/app/types/metodoPago";
import { OkPacket, RowDataPacket } from "mysql2";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  
  const { id: idStr } = await params;
  const id = Number(idStr);

  const {
    tipoPagoId,
    proveedor,
    numeroCuenta,
    fechaVencimiento,
    isPrimary = 0,
  } = await req.json();

  if (!tipoPagoId || !numeroCuenta || !fechaVencimiento) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  try {
    await db.query<OkPacket>(
      `UPDATE ecommerce.usuario_metodo_pago
         SET id_tipo_pago      = ?,
             proveedor         = ?,
             numero_cuenta     = ?,
             fecha_vencimiento = ?,
             es_predeterminado = ?
       WHERE id = ?`,
      [tipoPagoId, proveedor, numeroCuenta, fechaVencimiento, isPrimary, id]
    );

    if (isPrimary) {
      // obtener userId del registro actualizado
      const [[row]] = await db.query<RowDataPacket[]>(
        `SELECT id_usuario FROM ecommerce.usuario_metodo_pago WHERE id = ?`,
        [id]
      );
      const userId = (row as any).id_usuario;
      await db.query<OkPacket>(
        `UPDATE ecommerce.usuario_metodo_pago
         SET es_predeterminado = 0
         WHERE id_usuario = ? AND id <> ?`,
        [userId, id]
      );
    }

    const [updatedRows] = await db.query<MetodoPagoRow[]>(
      `SELECT 
        ump.id,
        ump.id_usuario,
        ump.id_tipo_pago,
        tp.valor       AS tipo,
        ump.proveedor,
        ump.numero_cuenta,
        DATE_FORMAT(ump.fecha_vencimiento,'%Y-%m-%d') AS fecha_vencimiento,
        ump.es_predeterminado
      FROM ecommerce.usuario_metodo_pago AS ump
      JOIN ecommerce.tipo_pago AS tp
        ON tp.id = ump.id_tipo_pago
      WHERE ump.id = ?`,
      [id]
    );
    return NextResponse.json(updatedRows[0]);
  } catch (error) {
    console.error("Error updating método de pago:", error);
    return NextResponse.json(
      { error: "Error updating método de pago" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }  
) {
  const { id } = await context.params;
  const idNum = Number(id);

  try {
    await db.query<OkPacket>(
      `DELETE FROM ecommerce.usuario_metodo_pago WHERE id = ?`,
      [idNum]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting método de pago:", error);
    return NextResponse.json(
      { error: "Error deleting método de pago" },
      { status: 500 }
    );
  }
}
