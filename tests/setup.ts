import { vi } from "vitest";
// Mock de DB - evita conexión real a MySQL
vi.mock("@/lib/db", () => ({
  db: {
    query: vi.fn(),
  },
}));
// Mock de Auth - simula sesión autenticada
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));