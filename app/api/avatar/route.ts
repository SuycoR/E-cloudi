import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { uploadBufferToS3 } from "@/lib/s3";
import { db } from "@/lib/db";
import { auth } from "../auth/[...nextauth]/route";

// Endpoint to receive avatar (multipart/form-data) and metadata
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    // require multipart/form-data
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expecting multipart/form-data" },
        { status: 400 }
      );
    }

    const session = await auth();
    const usuarioId = session?.user?.id ?? null;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Optional metadata fields
    const calidadFotoJson =
      formData.get("calidad_foto_json")?.toString() ?? null;
    const temporalPalette =
      formData.get("temporal_palette")?.toString() ?? null;
    const tonoPiel = formData.get("tono_piel")?.toString() ?? null;
    const subtono = formData.get("subtono")?.toString() ?? null;
    const coloresRecomendadosJson =
      formData.get("colores_recomendados_json")?.toString() ?? null;
    const usuarioAvatarJson =
      formData.get("usuario_avatar_json")?.toString() ?? null;

    // upload file to S3
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = `usuario_avatar/${Date.now()}_${file.name}`;
    await uploadBufferToS3(buffer, key, file.type || "image/jpeg");

    // create usuario_avatar table if not exists
    const createSql = `
      CREATE TABLE IF NOT EXISTS usuario_avatar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NULL,
        imagen_avatar VARCHAR(255) NOT NULL,
        calidad_foto_json TEXT NULL,
        create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        temporal_palette VARCHAR(45) NULL,
        tono_piel VARCHAR(45) NULL,
        subtono VARCHAR(45) NULL,
        colores_recomendados_json VARCHAR(255) NULL,
        usuario_avatar_json VARCHAR(255) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await db.query(createSql);
    } catch (e) {
      console.warn("Could not ensure usuario_avatar table:", e);
    }

    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // insert record
    try {
      const [result] = await db.query(
        `INSERT INTO usuario_avatar (usuario_id, imagen_avatar, calidad_foto_json, temporal_palette, tono_piel, subtono, colores_recomendados_json, usuario_avatar_json) VALUES (?,?,?,?,?,?,?,?)`,
        [
          usuarioId,
          key,
          calidadFotoJson,
          temporalPalette,
          tonoPiel,
          subtono,
          coloresRecomendadosJson,
          usuarioAvatarJson,
        ]
      );
      const insertId = (result as any)?.insertId;
      return NextResponse.json({ ok: true, id: insertId, key, url: s3Url });
    } catch (dbErr) {
      console.error("DB insert failed for usuario_avatar:", dbErr);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("avatar route error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
