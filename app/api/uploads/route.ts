import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { uploadBufferToS3 } from "@/lib/s3";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// This route accepts multipart/form-data with a file field named `file`.
// It also accepts JSON body with `images` array of URLs to fetch and save to S3.

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Get session early so both multipart and JSON branches can persist with usuario_id
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Ensure `prueba_virtual` table exists (simple schema). If you prefer a migration, remove this.
    const createPruebaSql = `
      CREATE TABLE IF NOT EXISTS prueba_virtual (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NULL,
        producto_especifico_id INT NULL,
        url_imagen_resultado VARCHAR(1024) NOT NULL,
        create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        guarda_resultado VARCHAR(45) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await db.query(createPruebaSql);
    } catch (e) {
      console.warn("Could not create prueba_virtual table (continuing):", e);
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      // Extract optional metadata
      const productIdRaw = formData.get("productId");
      const guardaRaw = formData.get("guarda_resultado");
      const productoEspecificoId = productIdRaw ? Number(productIdRaw) : null;
      const guarda = guardaRaw ? String(guardaRaw) : null;

      const uploadedFiles: {
        originalName: string;
        key: string;
        insertedId?: number;
      }[] = [];

      for (const [fieldName, value] of formData.entries()) {
        if (value instanceof File) {
          try {
            const file = value as File;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const extMatch =
              (file.name.match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/) || [])[1] ||
              "jpg";
            // Use 'uploads/' prefix for original user uploads (field name 'original'),
            // otherwise store under 'generated/' for programmatic/generated images.
            const prefix = fieldName === "original" ? "uploads" : "generated";
            const key = `${prefix}/${Date.now()}_${Math.random()
              .toString(36)
              .slice(2, 8)}.${extMatch}`;
            await uploadBufferToS3(buffer, key, file.type || "image/jpeg");

            try {
              const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
              const [result] = await db.query(
                "INSERT INTO prueba_virtual (usuario_id, producto_especifico_id, url_imagen_resultado, guarda_resultado) VALUES (?,?,?,?)",
                [userId, productoEspecificoId, s3Url, guarda]
              );
              const insertId = (result as any)?.insertId;
              uploadedFiles.push({
                originalName: file.name,
                key,
                insertedId: insertId,
              });
            } catch (dbErr) {
              console.warn("DB insert failed for prueba_virtual", key, dbErr);
              uploadedFiles.push({ originalName: file.name, key });
            }
          } catch (fileErr) {
            console.warn("Failed to process uploaded file", fieldName, fileErr);
          }
        }
      }

      return NextResponse.json({ ok: true, uploaded: uploadedFiles });
    }

    // JSON request to save remote generated images to S3
    const body = await req.json();
    const images: string[] = body.images || [];
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const uploaded: {
      originalUrl: string;
      key: string;
      insertedId?: number;
    }[] = [];

    // Helper: fetch with retries and per-attempt timeout
    async function fetchWithRetries(
      url: string,
      attempts = 3,
      timeoutMs = 30000
    ): Promise<Response | null> {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(url, {
            signal: controller.signal,
            headers: {
              "User-Agent": "E-cloudi/1.0 (+https://your-domain.example)",
            },
          });
          clearTimeout(timeout);
          if (!res.ok) {
            console.warn(
              `Fetch attempt ${attempt} for ${url} returned ${res.status}`
            );
            // don't retry on 4xx client errors
            if (res.status >= 400 && res.status < 500) return null;
            // otherwise try again
            continue;
          }
          return res;
        } catch (err) {
          clearTimeout(timeout);
          const errAny = err as any;
          // If last attempt, rethrow so caller can record/log
          if (attempt === attempts) {
            throw err;
          }
          // Otherwise wait with backoff and retry
          const backoff = 500 * Math.pow(2, attempt - 1); // 500ms, 1000ms, 2000ms...
          console.warn(
            `Fetch attempt ${attempt} failed for ${url}, retrying in ${backoff}ms:`,
            errAny?.message || errAny
          );
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
      }
      return null;
    }

    for (const url of images) {
      try {
        // Try fetching the remote image with retries/backoff
        let res: Response | null = null;
        try {
          res = await fetchWithRetries(url, 3, 30000);
        } catch (err) {
          console.warn(
            `All fetch attempts failed for ${url}:`,
            (err as any)?.message || err
          );
          res = null;
        }

        if (!res || !res.ok) {
          console.warn(
            `Skipping image, remote fetch failed or returned non-OK: ${url} -- status: ${res?.status}`
          );
          continue;
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extMatch =
          (url.match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/) || [])[1] || "jpg";
        const key = `generated/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.${extMatch}`;
        await uploadBufferToS3(
          buffer,
          key,
          res.headers.get("content-type") || "image/jpeg"
        );
        // Persist record in prueba_virtual table
        try {
          const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
          const productoEspecificoId = body.productId ?? null;
          const guarda = body.guarda_resultado ?? null;
          const [result] = await db.query(
            "INSERT INTO prueba_virtual (usuario_id, producto_especifico_id, url_imagen_resultado, guarda_resultado) VALUES (?,?,?,?)",
            [userId, productoEspecificoId, s3Url, guarda]
          );
          const insertId = (result as any)?.insertId;
          uploaded.push({ originalUrl: url, key, insertedId: insertId });
        } catch (dbErr) {
          console.warn("DB insert failed for prueba_virtual", key, dbErr);
          uploaded.push({ originalUrl: url, key });
        }
      } catch (e) {
        // Log more explicitly when it's an abort/timeout
        const errAny = e as any;
        if (
          errAny &&
          (errAny.name === "AbortError" || errAny.type === "aborted")
        ) {
          console.warn(`Timeout fetching remote image (skipped): ${url}`);
        } else {
          console.warn("Failed to fetch/upload", url, e);
        }
        // continue with next image
      }
    }

    return NextResponse.json({ ok: true, uploaded });
  } catch (error) {
    console.error("uploads route error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
