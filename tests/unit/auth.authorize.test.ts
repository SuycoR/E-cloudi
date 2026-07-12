import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

// next-auth intenta importar "next/server" al cargarse, lo cual rompe bajo Vitest
// (entorno node plano, sin el bundler de Next). Lo mockeamos para poder cargar el
// módulo real de lib/auth.ts y llegar al authorize() real sin romper nada.
vi.mock("next-auth", () => ({
  default: vi.fn(() => ({ auth: vi.fn(), handlers: {} })),
}));
vi.mock("next-auth/providers/credentials", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: vi.fn((config: any) => config),
}));

// tests/setup.ts mockea @/lib/auth globalmente (solo expone `auth: vi.fn()`).
// Para probar authorize() necesitamos el módulo real; lo re-mockeamos aquí
// devolviendo authOptions real y manteniendo `auth` mockeado por consistencia.
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, auth: vi.fn() };
});

const { authOptions } = await import("@/lib/auth");

// authOptions.providers[0] es el CredentialsProvider configurado en lib/auth.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authorize = (authOptions.providers[0] as any).authorize as (
  credentials: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

function mockAuthUserResult(resultado: unknown) {
  (db.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
    [[{ resultado: JSON.stringify(resultado) }]],
  ]);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("lib/auth.ts authorize() — CP-AUTH-001/002/003", () => {
  it("CP-AUTH-001: credenciales válidas crean sesión con id/surname/phone, pero typeDocument/documentId quedan undefined (bug confirmado en authUser SP)", async () => {
    const hash = await bcrypt.hash("Correcto123", 10);
    mockAuthUserResult({
      ok: true,
      usuario: {
        id: 1,
        nombre: "Juan",
        apellido: "Perez",
        email: "usuario@test.com",
        telefono: "987654321",
        contrasena: hash,
      },
    });

    const result = await authorize({
      email: "usuario@test.com",
      password: "Correcto123",
    });

    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
    expect(result.email).toBe("usuario@test.com");
    expect(result.surname).toBe("Perez");
    expect(result.phone).toBe("987654321");
    // Hallazgo verificado con SHOW CREATE PROCEDURE authUser: el SP nunca selecciona
    // tipo_identificacion/identificacion, por lo que estos campos siempre llegan undefined.
    expect(result.typeDocument).toBeUndefined();
    expect(result.documentId).toBeUndefined();
  });

  it("CP-AUTH-002: password incorrecta hace que authorize() retorne null", async () => {
    const hash = await bcrypt.hash("Correcto123", 10);
    mockAuthUserResult({
      ok: true,
      usuario: {
        id: 1,
        nombre: "Juan",
        apellido: "Perez",
        email: "usuario@test.com",
        telefono: "987654321",
        contrasena: hash,
      },
    });

    const result = await authorize({
      email: "usuario@test.com",
      password: "Incorrecto999",
    });

    expect(result).toBeNull();
  });

  it("CP-AUTH-003: email inexistente (ok:false, usuario:null) hace que authorize() lance un TypeError no controlado", async () => {
    mockAuthUserResult({ ok: false, usuario: null });

    await expect(
      authorize({ email: "noexiste@test.com", password: "cualquiera" })
    ).rejects.toThrow(TypeError);
    // Confirma el hallazgo documentado: el código hace data.usuario.contrasena
    // sin verificar antes data.ok, y data.usuario es null en este escenario.
  });
});
