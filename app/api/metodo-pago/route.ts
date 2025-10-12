import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MetodoPagoRow } from "@/app/types/metodoPago";
import { OkPacket } from "mysql2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "Falta user_id" }, { status: 400 });
  }

  try {
    const [rows] = await db.query<MetodoPagoRow[]>(
      `SELECT 
         ump.id,
         ump.id_usuario,
         ump.id_tipo_pago,
         tp.valor       AS tipo,
         ump.proveedor,
         ump.numero_cuenta,
         DATE_FORMAT(ump.fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento,
         ump.es_predeterminado
       FROM Ecommerce.usuario_metodo_pago AS ump
       JOIN Ecommerce.tipo_pago AS tp
         ON tp.id = ump.id_tipo_pago
       WHERE ump.id_usuario = ?`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching métodos de pago:", error);
    return NextResponse.json(
      { error: "Error fetching métodos de pago" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const {
    userId,
    tipoPagoId,
    proveedor,
    numeroCuenta,
    fechaVencimiento,
    isPrimary = 0,
  } = await req.json();

  if (!userId || !tipoPagoId || !numeroCuenta || !fechaVencimiento) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  try {
    const [result] = await db.query<OkPacket>(
      `INSERT INTO Ecommerce.usuario_metodo_pago
         (id_usuario, id_tipo_pago, proveedor, numero_cuenta, fecha_vencimiento, es_predeterminado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, tipoPagoId, proveedor, numeroCuenta, fechaVencimiento, isPrimary]
    );

    if (isPrimary) {
      await db.query<OkPacket>(
        `UPDATE Ecommerce.usuario_metodo_pago
         SET es_predeterminado = 0
         WHERE id_usuario = ? AND id <> ?`,
        [userId, result.insertId]
      );
    }

    const [newRows] = await db.query<MetodoPagoRow[]>(`
      SELECT 
        ump.id,
        ump.id_usuario,
        ump.id_tipo_pago,
        tp.valor       AS tipo,
        ump.proveedor,
        ump.numero_cuenta,
        DATE_FORMAT(ump.fecha_vencimiento,'%Y-%m-%d') AS fecha_vencimiento,
        ump.es_predeterminado
      FROM Ecommerce.usuario_metodo_pago AS ump
      JOIN Ecommerce.tipo_pago AS tp
        ON tp.id = ump.id_tipo_pago
      WHERE ump.id = ?
    `, [result.insertId]);

    return NextResponse.json(newRows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating método de pago:", error);
    return NextResponse.json(
      { error: "Error creating método de pago" },
      { status: 500 }
    );
  }
}
