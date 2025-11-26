import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { uploadBufferToS3, deleteObjectFromS3 } from "@/lib/s3";
import type {
  AvatarColorSwatch,
  PhotoScore,
  UserAvatarRecord,
} from "@/types/avatar";

const TABLE_SQL = `
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

const AWS_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION;

interface AvatarRow {
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

async function ensureTable() {
  await db.query(TABLE_SQL);
}

async function requireUserId() {
  const session = await auth();
  const rawId = session?.user?.id;
  const parsed = rawId ? Number(rawId) : NaN;
  if (!Number.isFinite(parsed)) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return parsed;
}

function readText(value: FormDataEntryValue | null): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

function parseJson<T>(value: FormDataEntryValue | null): T | null {
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

function normalizePhotoScores(raw: unknown): PhotoScore[] {
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

function normalizeColors(raw: unknown): AvatarColorSwatch[] {
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

function shrinkColorsForStorage(data: AvatarColorSwatch[]): string | null {
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

function expandColorsFromStorage(value: string | null): AvatarColorSwatch[] {
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

function extractKeyFromUrl(url: string | null) {
  if (!url) return null;
  const match = url.match(/amazonaws\.com\/(.+)$/);
  if (!match || !match[1]) return null;
  return match[1];
}

async function fetchAvatarRow(userId: number) {
  const [rows] = await db.query(
    "SELECT * FROM usuario_avatar WHERE usuario_id = ? LIMIT 1",
    [userId]
  );
  const typed = rows as AvatarRow[];
  return typed[0] ?? null;
}

async function upsertAvatar(
  userId: number,
  payload: {
    imageUrl: string | null;
    photoScores: PhotoScore[];
    temporada: string | null;
    tono: string | null;
    subtono: string | null;
    recommended: AvatarColorSwatch[];
    avoid: AvatarColorSwatch[];
  }
) {
  const photoJson = payload.photoScores.length
    ? JSON.stringify(payload.photoScores)
    : null;
  const recommendedJson = shrinkColorsForStorage(payload.recommended);
  const avoidJson = shrinkColorsForStorage(payload.avoid);

  await db.query(
    `INSERT INTO usuario_avatar
      (usuario_id, imagen_avatar, calidad_foto_json, temporada_palette, tono_piel, subtono, colores_recomendados_json, colores_evitar_json, create_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      imagen_avatar = VALUES(imagen_avatar),
      calidad_foto_json = VALUES(calidad_foto_json),
      temporada_palette = VALUES(temporada_palette),
      tono_piel = VALUES(tono_piel),
      subtono = VALUES(subtono),
      colores_recomendados_json = VALUES(colores_recomendados_json),
      colores_evitar_json = VALUES(colores_evitar_json),
      create_date = VALUES(create_date)`,
    [
      userId,
      payload.imageUrl,
      photoJson,
      payload.temporada,
      payload.tono,
      payload.subtono,
      recommendedJson,
      avoidJson,
    ]
  );
}

function mapRowToResponse(row: AvatarRow | null): UserAvatarRecord | null {
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

async function uploadAvatarImage(file: File, userId: number) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extMatch = file.name.match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/);
  const extension = extMatch ? extMatch[1] : "jpg";
  const key = `avatars/${userId}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
  await uploadBufferToS3(buffer, key, file.type || "image/jpeg");
  if (!AWS_BUCKET || !AWS_REGION) {
    throw new Error("AWS S3 environment variables are missing");
  }
  const url = `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  return { key, url };
}

export async function GET() {
  try {
    const userId = await requireUserId();
    await ensureTable();
    const row = await fetchAvatarRow(userId);
    return NextResponse.json({ ok: true, avatar: mapRowToResponse(row) });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("avatar GET error", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    await ensureTable();

    if (
      !(req.headers.get("content-type") || "").includes("multipart/form-data")
    ) {
      return NextResponse.json(
        { error: "Content-Type multipart/form-data required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("avatarImage");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "avatarImage file is required" },
        { status: 400 }
      );
    }

    const uploaded = await uploadAvatarImage(file, userId);

    const photoScoresRaw = parseJson<PhotoScore[]>(
      formData.get("photoQuality")
    );
    const recommendedRaw = parseJson<AvatarColorSwatch[]>(
      formData.get("coloresRecomendados")
    );
    const avoidRaw = parseJson<AvatarColorSwatch[]>(
      formData.get("coloresEvitar")
    );

    await upsertAvatar(userId, {
      imageUrl: uploaded.url,
      photoScores: normalizePhotoScores(photoScoresRaw),
      temporada: readText(formData.get("temporadaPalette")),
      tono: readText(formData.get("tonoPiel")),
      subtono: readText(formData.get("subtono")),
      recommended: normalizeColors(recommendedRaw),
      avoid: normalizeColors(avoidRaw),
    });

    const row = await fetchAvatarRow(userId);
    return NextResponse.json({ ok: true, avatar: mapRowToResponse(row) });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("avatar POST error", error);
    return NextResponse.json(
      { error: "Failed to guardar avatar" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await requireUserId();
    await ensureTable();

    if (
      !(req.headers.get("content-type") || "").includes("multipart/form-data")
    ) {
      return NextResponse.json(
        { error: "Content-Type multipart/form-data required" },
        { status: 400 }
      );
    }

    const current = await fetchAvatarRow(userId);
    const existingImage = current?.imagen_avatar ?? null;

    const formData = await req.formData();
    const file = formData.get("avatarImage");

    let imageUrl = existingImage;
    if (file instanceof File) {
      const uploaded = await uploadAvatarImage(file, userId);
      imageUrl = uploaded.url;
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Se requiere una imagen para actualizar" },
        { status: 400 }
      );
    }

    const photoScoresRaw = parseJson<PhotoScore[]>(
      formData.get("photoQuality")
    );
    const recommendedRaw = parseJson<AvatarColorSwatch[]>(
      formData.get("coloresRecomendados")
    );
    const avoidRaw = parseJson<AvatarColorSwatch[]>(
      formData.get("coloresEvitar")
    );

    const normalizedPhotoScores = normalizePhotoScores(photoScoresRaw);
    const normalizedRecommended = normalizeColors(recommendedRaw);
    const normalizedAvoid = normalizeColors(avoidRaw);

    const fallbackPhotoScores = current?.calidad_foto_json
      ? (JSON.parse(current.calidad_foto_json) as PhotoScore[])
      : [];
    const fallbackRecommended = expandColorsFromStorage(
      current?.colores_recomendados_json ?? null
    );
    const fallbackAvoid = expandColorsFromStorage(
      current?.colores_evitar_json ?? null
    );

    await upsertAvatar(userId, {
      imageUrl,
      photoScores: normalizedPhotoScores.length
        ? normalizedPhotoScores
        : fallbackPhotoScores,
      temporada:
        readText(formData.get("temporadaPalette")) ??
        current?.temporada_palette ??
        null,
      tono: readText(formData.get("tonoPiel")) ?? current?.tono_piel ?? null,
      subtono: readText(formData.get("subtono")) ?? current?.subtono ?? null,
      recommended: normalizedRecommended.length
        ? normalizedRecommended
        : fallbackRecommended,
      avoid: normalizedAvoid.length ? normalizedAvoid : fallbackAvoid,
    });

    const row = await fetchAvatarRow(userId);
    return NextResponse.json({ ok: true, avatar: mapRowToResponse(row) });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("avatar PUT error", error);
    return NextResponse.json(
      { error: "Failed to actualizar avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const userId = await requireUserId();
    await ensureTable();

    const current = await fetchAvatarRow(userId);
    if (!current) {
      return NextResponse.json({ ok: true, avatar: null });
    }

    const key = extractKeyFromUrl(current.imagen_avatar);
    if (key) {
      try {
        await deleteObjectFromS3(key);
      } catch (error) {
        console.warn("Failed to delete avatar image from S3", error);
      }
    }

    await db.query("DELETE FROM usuario_avatar WHERE usuario_id = ?", [userId]);
    return NextResponse.json({ ok: true, avatar: null });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("avatar DELETE error", error);
    return NextResponse.json(
      { error: "Failed to eliminar avatar" },
      { status: 500 }
    );
  }
}
