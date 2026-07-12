import mysql from "mysql2/promise";

export const testDb = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "ecloudi_test",
  port: Number(process.env.DB_PORT) || 3306,
});

export async function createTestProduct(cantidadStock: number) {
  const sku = `TEST-SKU-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const [productResult] = await testDb.query(
    "INSERT INTO producto (nombre, descripcion, marca) VALUES (?, ?, ?)",
    ["Producto de prueba", "Producto de prueba de integración", "Marca Test"]
  );
  const productId = (productResult as mysql.ResultSetHeader).insertId;

  const [especificoResult] = await testDb.query(
    "INSERT INTO producto_especifico (id_producto, SKU, cantidad_stock, precio) VALUES (?, ?, ?, ?)",
    [productId, sku, cantidadStock, 99.9]
  );
  const productoEspecificoId = (especificoResult as mysql.ResultSetHeader)
    .insertId;

  return { productId, productoEspecificoId };
}

export async function deleteTestProduct(productoEspecificoId: number, productId: number) {
  await testDb.query(
    "DELETE FROM carrito_compras_producto_especifico WHERE id_producto_especifico = ?",
    [productoEspecificoId]
  );
  await testDb.query("DELETE FROM producto_especifico WHERE id = ?", [
    productoEspecificoId,
  ]);
  await testDb.query("DELETE FROM producto WHERE id = ?", [productId]);
}

export async function deleteTestUserByEmail(email: string) {
  const [rows] = await testDb.query<mysql.RowDataPacket[]>(
    "SELECT id FROM usuario WHERE email = ?",
    [email]
  );
  for (const row of rows) {
    const userId = row.id as number;
    const [carritos] = await testDb.query<mysql.RowDataPacket[]>(
      "SELECT id FROM carrito_compras WHERE id_usuario = ?",
      [userId]
    );
    for (const carrito of carritos) {
      await testDb.query(
        "DELETE FROM carrito_compras_producto_especifico WHERE id_carrito = ?",
        [carrito.id]
      );
    }
    await testDb.query("DELETE FROM carrito_compras WHERE id_usuario = ?", [
      userId,
    ]);
    await testDb.query("DELETE FROM usuario WHERE id = ?", [userId]);
  }
}

export async function getUserByEmail(email: string) {
  const [rows] = await testDb.query<mysql.RowDataPacket[]>(
    "SELECT id, email, contrasena FROM usuario WHERE email = ?",
    [email]
  );
  return rows;
}

export async function getCartQuantity(
  userId: number,
  productoEspecificoId: number
) {
  const [rows] = await testDb.query<mysql.RowDataPacket[]>(
    `SELECT ccpe.cantidad FROM carrito_compras_producto_especifico ccpe
     JOIN carrito_compras cc ON cc.id = ccpe.id_carrito
     WHERE cc.id_usuario = ? AND ccpe.id_producto_especifico = ?`,
    [userId, productoEspecificoId]
  );
  return rows[0]?.cantidad as number | undefined;
}
