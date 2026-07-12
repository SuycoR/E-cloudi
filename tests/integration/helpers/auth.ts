import type { APIRequestContext } from "@playwright/test";

export async function loginViaCredentials(
  request: APIRequestContext,
  email: string,
  password: string
) {
  const csrfRes = await request.get("/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();

  const callbackRes = await request.post("/api/auth/callback/credentials", {
    data: {
      email,
      password,
      csrfToken,
      json: "true",
    },
  });

  return callbackRes;
}

export async function getSession(request: APIRequestContext) {
  const res = await request.get("/api/auth/session");
  return res.json();
}
