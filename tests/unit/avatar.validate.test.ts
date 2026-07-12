import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/avatar/validate/route";
import { auth } from "@/lib/auth";

vi.mock("@/lib/avatarPhotoValidator", () => ({
  validateAvatarPhoto: vi.fn(),
}));

import { validateAvatarPhoto } from "@/lib/avatarPhotoValidator";

function buildFormRequest(file: File | null) {
  const formData = new FormData();
  if (file) formData.set("avatarImage", file);
  return new Request("http://localhost/api/avatar/validate", {
    method: "POST",
    body: formData,
  });
}

const mockSession = {
  user: { id: "23", name: "Cristian", email: "cristiansotelo@gmail.com" },
};

const sampleResult = {
  verdict: "approved" as const,
  confidence: 0.9,
  reasons: [],
  tips: [],
  photoScores: [{ label: "Nitidez", value: 80 }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/avatar/validate", () => {
  it("CP-IA-001: foto válida con sesión iniciada responde 200 {ok:true, result}", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    (validateAvatarPhoto as ReturnType<typeof vi.fn>).mockResolvedValue(
      sampleResult
    );

    const file = new File(["contenido-imagen"], "foto.jpg", {
      type: "image/jpeg",
    });
    const res = await POST(buildFormRequest(file) as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.result).toEqual(sampleResult);
  });

  it("CP-IA-002: sin sesión iniciada responde 401 Unauthorized", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const file = new File(["contenido-imagen"], "foto.jpg", {
      type: "image/jpeg",
    });
    const res = await POST(buildFormRequest(file) as never);

    expect(res.status).toBe(401);
    expect(validateAvatarPhoto).not.toHaveBeenCalled();
  });

  it("CP-IA-006: archivo de tamaño excesivo NO es rechazado por la ruta (confirma ausencia de límite explícito)", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    (validateAvatarPhoto as ReturnType<typeof vi.fn>).mockResolvedValue(
      sampleResult
    );

    // 6MB simulados (no hace falta llegar a 50MB para probar la ausencia del guard)
    const oversizedBuffer = new Uint8Array(6 * 1024 * 1024);
    const file = new File([oversizedBuffer], "foto-grande.jpg", {
      type: "image/jpeg",
    });

    const res = await POST(buildFormRequest(file) as never);

    // Comportamiento actual (hallazgo de riesgo, severidad Baja): no hay validación de
    // tamaño en el código, por lo que la ruta llega hasta validateAvatarPhoto sin rechazar.
    expect(res.status).toBe(200);
    expect(validateAvatarPhoto).toHaveBeenCalledTimes(1);
  });
});
