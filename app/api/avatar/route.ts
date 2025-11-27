import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { uploadBufferToS3, deleteObjectFromS3 } from "@/lib/s3";
import {
  ensureTable,
  expandColorsFromStorage,
  fetchAvatarRow,
  mapRowToResponse,
  normalizeColors,
  normalizePhotoScores,
  parseJson,
  readText,
  upsertAvatar,
} from "@/lib/avatarStorage";
import type { AvatarColorSwatch, PhotoScore } from "@/types/avatar";

const AWS_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION;

async function requireUserId() {
  const session = await auth();
  const rawId = session?.user?.id;
  const parsed = rawId ? Number(rawId) : NaN;
  if (!Number.isFinite(parsed)) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return parsed;
}
function extractKeyFromUrl(url: string | null) {
  if (!url) return null;
  const match = url.match(/amazonaws\.com\/(.+)$/);
  if (!match || !match[1]) return null;
  return match[1];
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
