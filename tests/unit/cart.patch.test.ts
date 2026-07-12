import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "@/app/api/cart/[productId]/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
// ─── Helpers ──────────────────────────────────────────────
function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/cart/1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
function buildContext(productId: string = "1") {
  return { params: Promise.resolve({ productId }) };
}
const mockSession = {
  user: { id: "23", name: "Cristian", email: "cristiansotelo@gmail.com" },
};
const stockRow = [{ Cantidad_stock: 10 }];
const cartRow = [{ id: 100 }];
const productInCart = [{ cantidad: 2 }];
// ─── Setup ────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  (auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
  (db.query as ReturnType<typeof vi.fn>)
    .mockResolvedValueOnce([stockRow])    // 1° query: stock
    .mockResolvedValueOnce([cartRow])     // 2° query: carrito
    .mockResolvedValueOnce([productInCart]); // 3° query: producto en carrito
});
// ─── Tests ────────────────────────────────────────────────
describe("PATCH /api/cart/[productId] - Validación de cantidad", () => {
  // ── CP-CART-010: Caso principal ──────────────────────────
  it("CP-CART-010: quantity=1.5 debe retornar 400 (cantidad no entera)", async () => {
    const req = buildRequest({ quantity: 1.5 });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/entero/i);
  });
  // ── Casos adicionales de cobertura de rama ───────────────
  it("quantity=0 debe retornar 400", async () => {
    const req = buildRequest({ quantity: 0 });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(400);
  });
  it("quantity=-3 debe retornar 400", async () => {
    const req = buildRequest({ quantity: -3 });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(400);
  });
  it("quantity='abc' (string) debe retornar 400", async () => {
    const req = buildRequest({ quantity: "abc" });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(400);
  });
  it("quantity=null debe retornar 400", async () => {
    const req = buildRequest({ quantity: null });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(400);
  });
  it("quantity=undefined (campo ausente) debe retornar 400", async () => {
    const req = buildRequest({});
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(400);
  });
  it("quantity=2.0001 debe retornar 400", async () => {
    const req = buildRequest({ quantity: 2.0001 });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(400);
  });
  // ── Casos positivos ──────────────────────────────────────
  it("quantity=1 (entero válido) debe retornar 200", async () => {
    const req = buildRequest({ quantity: 1 });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
  it("quantity=5 (entero válido dentro de stock) debe retornar 200", async () => {
    const req = buildRequest({ quantity: 5 });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
  it("quantity=2.0 (float entero) debe retornar 200", async () => {
    const req = buildRequest({ quantity: 2.0 });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
  // ── Caso: excede stock ───────────────────────────────────
  it("quantity=15 (supera stock=10) debe retornar 400", async () => {
    const req = buildRequest({ quantity: 15 });
    const res = await PATCH(req, buildContext("1"));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/disponibles/i);
  });
});