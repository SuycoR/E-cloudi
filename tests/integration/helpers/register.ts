import type { APIRequestContext } from "@playwright/test";

export type RegisterPayload = {
  nombre: string;
  apellido: string;
  tipo_identificacion: string;
  identificacion: string;
  email: string;
  telefono: string;
  contrasena: string;
};

export function buildRegisterPayload(
  overrides: Partial<RegisterPayload> = {}
): RegisterPayload {
  return {
    nombre: "Integración",
    apellido: "Test",
    tipo_identificacion: "DNI",
    identificacion: "87654321",
    email: "integracion@test.com",
    telefono: "987654321",
    contrasena: "Correcto123",
    ...overrides,
  };
}

export async function registerUser(
  request: APIRequestContext,
  overrides: Partial<RegisterPayload> = {}
) {
  const payload = buildRegisterPayload(overrides);
  const res = await request.post("/api/auth/register", { data: payload });
  return { res, payload };
}
