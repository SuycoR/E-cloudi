import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/direccion/anadir/route";
import { db } from "@/lib/db";

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/direccion/anadir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/direccion/anadir — CP-DIR-003", () => {
  it("CP-DIR-003: usuario_id inexistente igual responde 201, sin inspeccionar @resultado del SP", async () => {
    (db.query as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{}]) // CALL CrearDireccionConUsuario(...)
      .mockResolvedValueOnce([
        [{ direccion_id: null, resultado: "USUARIO_NO_EXISTE" }],
      ]); // SELECT @direccion_id, @resultado

    const req = buildRequest({
      usuario_id: 999999,
      piso: "3",
      lote: "12",
      calle: "Av. Siempre Viva",
      distrito: "Miraflores",
      codigo_postal: "15074",
    });

    const res = await POST(req as never);
    const body = await res.json();

    // Comportamiento actual (bug confirmado): siempre 201, sin importar el valor de @resultado.
    expect(res.status).toBe(201);
    expect(body.resultado).toBe("USUARIO_NO_EXISTE");
  });
});
