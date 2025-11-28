import { db } from "./db";
import type {
  AvatarColorSwatch,
  PhotoScore,
  UserAvatarRecord,
} from "@/types/avatar";

export const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS usuario_avatar (
    usuario_id INT PRIMARY KEY,
    imagen_avatar VARCHAR(255),
    calidad_foto_json TEXT,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    temporada_palette VARCHAR(45),
    tono_piel VARCHAR(45),
    subtono VARCHAR(45),
    colores_recomendados_json VARCHAR(255),
    colores_evitar_json VARCHAR(255),
    CONSTRAINT fk_usuario_avatar_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export interface AvatarRow {
  usuario_id: number;
  imagen_avatar: string | null;
  calidad_foto_json: string | null;
  create_date: Date | null;
  temporada_palette: string | null;
  tono_piel: string | null;
  subtono: string | null;
  colores_recomendados_json: string | null;
  colores_evitar_json: string | null;
}

export async function ensureTable() {
  await db.query(TABLE_SQL);
}

export function readText(value: FormDataEntryValue | null): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

export function parseJson<T>(value: FormDataEntryValue | null): T | null {
  if (!value) return null;
  const text = typeof value === "string" ? value : value.toString();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.warn("Invalid JSON payload received in avatar route", error);
    return null;
  }
}

export function normalizePhotoScores(raw: unknown): PhotoScore[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const label = "label" in entry ? String((entry as any).label) : null;
      const valueRaw = "value" in entry ? Number((entry as any).value) : NaN;
      if (!label || !Number.isFinite(valueRaw)) return null;
      return { label, value: valueRaw } satisfies PhotoScore;
    })
    .filter(Boolean) as PhotoScore[];
}

export function normalizeColors(raw: unknown): AvatarColorSwatch[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const name = (entry as any).name ?? (entry as any).n;
      const hex = (entry as any).hex ?? (entry as any).h;
      if (!name || typeof name !== "string") return null;
      const hexValue = typeof hex === "string" && hex.length > 0 ? hex : "";
      return { name, hex: hexValue } satisfies AvatarColorSwatch;
    })
    .filter(Boolean) as AvatarColorSwatch[];
}

export function shrinkColorsForStorage(data: AvatarColorSwatch[]): string | null {
  if (!data.length) return null;
  const compact = data
    .map((item) => ({ n: item.name, h: item.hex }))
    .slice(0, 8);
  let json = JSON.stringify(compact);
  if (json.length > 255) {
    json = JSON.stringify(compact.slice(0, 5));
  }
  return json;
}

export function expandColorsFromStorage(value: string | null): AvatarColorSwatch[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Array<{ n?: string; h?: string }>;
    return parsed
      .map((item) => ({
        name: item.n ?? "",
        hex: item.h ?? "",
      }))
      .filter((item) => item.name.length > 0);
  } catch (error) {
    console.warn("Failed to parse stored color palette", error);
    return [];
  }
}

export async function fetchAvatarRow(userId: number) {
  const [rows] = await db.query(
    "SELECT * FROM usuario_avatar WHERE usuario_id = ? LIMIT 1",
    [userId]
  );
  const typed = rows as AvatarRow[];
  return typed[0] ?? null;
}

export async function upsertAvatar(
  userId: number,
  payload: {
    imageUrl: string | null;
    photoScores: PhotoScore[];
    temporada: string | null;
    tono: string | null;
    subtono: string | null;
    recommended: AvatarColorSwatch[];
    avoid: AvatarColorSwatch[];
    createdAt?: Date;
  }
) {
  const createdAt = payload.createdAt ?? new Date();
  const photoJson = payload.photoScores.length
    ? JSON.stringify(payload.photoScores)
    : null;
  const recommendedJson = shrinkColorsForStorage(payload.recommended);
  const avoidJson = shrinkColorsForStorage(payload.avoid);

  await db.query(
    `INSERT INTO usuario_avatar
      (usuario_id, imagen_avatar, calidad_foto_json, temporada_palette, tono_piel, subtono, colores_recomendados_json, colores_evitar_json, create_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      imagen_avatar = VALUES(imagen_avatar),
      calidad_foto_json = VALUES(calidad_foto_json),
      temporada_palette = VALUES(temporada_palette),
      tono_piel = VALUES(tono_piel),
      subtono = VALUES(subtono),
      colores_recomendados_json = VALUES(colores_recomendados_json),
      colores_evitar_json = VALUES(colores_evitar_json)`,
    [
      userId,
      payload.imageUrl,
      photoJson,
      payload.temporada,
      payload.tono,
      payload.subtono,
      recommendedJson,
      avoidJson,
      createdAt,
    ]
  );
}

export function mapRowToResponse(row: AvatarRow | null): UserAvatarRecord | null {
  if (!row) return null;
  const quality = row.calidad_foto_json
    ? (JSON.parse(row.calidad_foto_json) as PhotoScore[])
    : [];
  return {
    usuarioId: row.usuario_id,
    imagenAvatar: row.imagen_avatar,
    calidadFoto: quality,
    createDate: row.create_date ? row.create_date.toISOString() : null,
    temporadaPalette: row.temporada_palette,
    tonoPiel: row.tono_piel,
    subtono: row.subtono,
    coloresRecomendados: expandColorsFromStorage(row.colores_recomendados_json),
    coloresEvitar: expandColorsFromStorage(row.colores_evitar_json),
  };
}

export async function getUserAvatarRecord(userId: number) {
  await ensureTable();
  const row = await fetchAvatarRow(userId);
  return mapRowToResponse(row);
}
