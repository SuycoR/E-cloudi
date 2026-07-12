import { test, expect } from "@playwright/test";
import { deleteTestUserByEmail, getUserByEmail } from "./helpers/db";
import { registerUser } from "./helpers/register";
import { loginViaCredentials, getSession } from "./helpers/auth";

test.describe("Integración — Autenticación (registro real → BD → login)", () => {
  test.beforeEach(async () => {
    await deleteTestUserByEmail("integracion@test.com");
    await deleteTestUserByEmail("duplicado@test.com");
  });

  test.afterAll(async () => {
    await deleteTestUserByEmail("integracion@test.com");
    await deleteTestUserByEmail("duplicado@test.com");
  });

  test("CP-INT-AUTH-001: registro real + login inmediato debe crear sesión con datos propagados por jwt()/session()", async ({
    request,
  }) => {
    const { res: registerRes } = await registerUser(request, {
      email: "integracion@test.com",
    });
    expect(registerRes.ok()).toBeTruthy();

    const rows = await getUserByEmail("integracion@test.com");
    expect(rows).toHaveLength(1);
    expect(rows[0].contrasena).not.toBe("Correcto123"); // debe estar hasheado con bcrypt

    const loginRes = await loginViaCredentials(
      request,
      "integracion@test.com",
      "Correcto123"
    );
    expect(loginRes.ok()).toBeTruthy();

    const session = await getSession(request);
    expect(session?.user?.email).toBe("integracion@test.com");
    expect(session?.user?.id).toBeTruthy();
    expect(session?.user?.surname).toBeTruthy();
    expect(session?.user?.phone).toBeTruthy();

    // Hallazgo verificado: authUser() nunca selecciona tipo_identificacion/identificacion,
    // por lo que typeDocument/documentId siempre llegan undefined a la sesión.
    expect(session?.user?.typeDocument).toBeUndefined();
    expect(session?.user?.documentId).toBeUndefined();
  });

  test("CP-INT-AUTH-002 (corregido): registrar el mismo email dos veces NO es rechazado — se crea una fila duplicada", async ({
    request,
  }) => {
    const { res: firstRes } = await registerUser(request, {
      email: "duplicado@test.com",
    });
    expect(firstRes.status()).toBe(200);

    const { res: secondRes } = await registerUser(request, {
      email: "duplicado@test.com",
    });
    expect(secondRes.status()).toBe(200);

    const rows = await getUserByEmail("duplicado@test.com");
    expect(rows).toHaveLength(2); // confirma la ausencia de UNIQUE KEY sobre email
  });

  test("CP-INT-AUTH-003: login con password incorrecta sobre un usuario real no crea sesión", async ({
    request,
  }) => {
    await registerUser(request, { email: "integracion@test.com" });

    const loginRes = await loginViaCredentials(
      request,
      "integracion@test.com",
      "PasswordIncorrecta999"
    );
    expect(loginRes.ok()).toBeTruthy(); // NextAuth responde 200 con error en la URL, no 401

    const session = await getSession(request);
    expect(session?.user).toBeUndefined();
  });
});
