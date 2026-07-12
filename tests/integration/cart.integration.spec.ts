import { test, expect } from "@playwright/test";
import {
  createTestProduct,
  deleteTestProduct,
  deleteTestUserByEmail,
  getCartQuantity,
  getUserByEmail,
} from "./helpers/db";
import { registerUser } from "./helpers/register";
import { loginViaCredentials } from "./helpers/auth";

test.describe("Integración — Carrito y Stock (carrito acumulado vs. stock real)", () => {
  test.afterAll(async () => {
    await deleteTestUserByEmail("cart-user-a@test.com");
    await deleteTestUserByEmail("cart-user-b@test.com");
  });

  test("CP-INT-CART-001: agregar cantidad = stock disponible, luego +1 debe rechazar el segundo intento", async ({
    request,
  }) => {
    await deleteTestUserByEmail("cart-user-a@test.com");
    await registerUser(request, {
      email: "cart-user-a@test.com",
      identificacion: "11111111",
    });
    await loginViaCredentials(request, "cart-user-a@test.com", "Correcto123");

    const { productId, productoEspecificoId } = await createTestProduct(10);

    try {
      const firstRes = await request.post("/api/cart/addOrUpdate", {
        data: { productId: productoEspecificoId, cantidad: 10 },
      });
      expect(firstRes.status()).toBe(200);
      const firstBody = await firstRes.json();
      expect(firstBody.success).toBe(true);

      const secondRes = await request.post("/api/cart/addOrUpdate", {
        data: { productId: productoEspecificoId, cantidad: 1 },
      });
      expect(secondRes.status()).toBe(400);

      const users = await getUserByEmail("cart-user-a@test.com");
      const quantity = await getCartQuantity(users[0].id, productoEspecificoId);
      expect(quantity).toBe(10); // el segundo intento no debe haber modificado el carrito
    } finally {
      await deleteTestProduct(productoEspecificoId, productId);
    }
  });

  test("CP-INT-CART-002: dos usuarios agregando cada uno = stock total del mismo producto — ambos tienen éxito (riesgo de sobreventa)", async ({
    request,
  }) => {
    await deleteTestUserByEmail("cart-user-a@test.com");
    await deleteTestUserByEmail("cart-user-b@test.com");

    const { productId, productoEspecificoId } = await createTestProduct(5);

    try {
      await registerUser(request, {
        email: "cart-user-a@test.com",
        identificacion: "11111111",
      });
      await loginViaCredentials(request, "cart-user-a@test.com", "Correcto123");
      const resA = await request.post("/api/cart/addOrUpdate", {
        data: { productId: productoEspecificoId, cantidad: 5 },
      });
      expect(resA.status()).toBe(200);

      await registerUser(request, {
        email: "cart-user-b@test.com",
        identificacion: "22222222",
      });
      await loginViaCredentials(request, "cart-user-b@test.com", "Correcto123");
      const resB = await request.post("/api/cart/addOrUpdate", {
        data: { productId: productoEspecificoId, cantidad: 5 },
      });
      expect(resB.status()).toBe(200); // comportamiento actual: no hay reserva global de stock

      const userA = await getUserByEmail("cart-user-a@test.com");
      const userB = await getUserByEmail("cart-user-b@test.com");
      const qtyA = await getCartQuantity(userA[0].id, productoEspecificoId);
      const qtyB = await getCartQuantity(userB[0].id, productoEspecificoId);
      expect(qtyA).toBe(5);
      expect(qtyB).toBe(5);
      // 10 unidades reservadas en carritos sobre un stock real de 5: sobreventa potencial confirmada.
    } finally {
      await deleteTestProduct(productoEspecificoId, productId);
    }
  });
});
