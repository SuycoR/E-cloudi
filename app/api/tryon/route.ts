import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { RowDataPacket } from "mysql2";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash-image";

interface TryOnRequestBody {
  productId: number;
}

interface AvatarRow extends RowDataPacket {
  imagen_avatar: string | null;
}

interface ProductRow extends RowDataPacket {
  imagen_producto: string | null;
  nombre: string;
}

interface GeneratedView {
  id: string;
  label: string;
  url: string; // base64 data URL
}

/**
 * Fetches an image from a URL and converts it to base64
 */
async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mimeType: string }> {
  const url = imageUrl.startsWith("http")
    ? imageUrl
    : `${process.env.NEXT_PUBLIC_BASE_URL || ""}${imageUrl}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const mimeType = contentType.split(";")[0].trim();

  return { base64, mimeType };
}

/**
 * Generates a single virtual try-on view using Gemini 2.5 Flash
 */
async function generateSingleView(
  ai: GoogleGenAI,
  avatarBase64: string,
  avatarMimeType: string,
  productBase64: string,
  productMimeType: string,
  productName: string,
  viewType: { id: string; label: string; prompt: string }
): Promise<GeneratedView | null> {
  const contents = [
    {
      role: "user" as const,
      parts: [
        {
          inlineData: {
            mimeType: avatarMimeType,
            data: avatarBase64,
          },
        },
        {
          inlineData: {
            mimeType: productMimeType,
            data: productBase64,
          },
        },
        {
          text: `You are a professional virtual try-on AI. You have two images:
1. The first image is a photo of a person (the model/avatar)
2. The second image is a clothing item/garment called "${productName}"

${viewType.prompt}

IMPORTANT INSTRUCTIONS:
- Generate a NEW photorealistic image showing the person wearing the garment
- The garment should fit naturally on the person's body
- Preserve the person's face, skin tone, hair, and body proportions exactly
- Make it look like a real professional photo, not a digital composite
- The lighting should be natural and consistent
- Output ONLY the generated image`,
        },
      ],
    },
  ];

  const config = {
    responseModalities: ["IMAGE", "TEXT"] as ("IMAGE" | "TEXT")[],
  };

  // Don't catch errors here - let them propagate for retry logic
  const response = await ai.models.generateContentStream({
    model: MODEL_NAME,
    config,
    contents,
  });

  // Process the stream and collect the image
  for await (const chunk of response) {
    if (!chunk.candidates?.[0]?.content?.parts) {
      continue;
    }

    for (const part of chunk.candidates[0].content.parts) {
      // Check for inline image data
      const partWithData = part as {
        inlineData?: { data?: string; mimeType?: string };
      };
      if (partWithData.inlineData?.data && partWithData.inlineData?.mimeType) {
        const { data, mimeType } = partWithData.inlineData;
        return {
          id: viewType.id,
          label: viewType.label,
          url: `data:${mimeType};base64,${data}`,
        };
      }
    }
  }

  console.warn(`No image generated for view: ${viewType.id}`);
  return null;
}

/**
 * Generates virtual try-on images using Gemini 2.5 Flash
 * Creates 3 views: frontal, back, and lateral
 */
async function generateTryOnWithGemini(
  avatarBase64: string,
  avatarMimeType: string,
  productBase64: string,
  productMimeType: string,
  productName: string
): Promise<GeneratedView[]> {
  const ai = new GoogleGenAI({
    apiKey: GOOGLE_AI_API_KEY,
  });

  const views = [
    {
      id: "front",
      label: "Frontal",
      prompt: `Generate a FRONTAL view of the person wearing this "${productName}".
The person should be facing the camera directly.
Show the full upper body with the garment clearly visible.
The background should be clean, neutral, and professional (like a fashion photoshoot).`,
    },
    {
      id: "side",
      label: "Lateral",
      prompt: `Generate a SIDE/PROFILE view of the person wearing this "${productName}".
The person should be turned 90 degrees, showing their profile.
Show how the garment fits from the side angle.
The background should be clean, neutral, and professional.`,
    },
  ];

  const results: GeneratedView[] = [];

  // Generate each view sequentially with proper delays to respect rate limits
  for (let i = 0; i < views.length; i++) {
    const view = views[i];
    console.log(`Generating ${view.id} view...`);

    // Retry logic for rate limit errors
    let result: GeneratedView | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts && !result) {
      attempts++;

      try {
        result = await generateSingleView(
          ai,
          avatarBase64,
          avatarMimeType,
          productBase64,
          productMimeType,
          productName,
          view
        );
      } catch (error: unknown) {
        const errorObj = error as { status?: number };
        // If rate limited (429), wait and retry
        if (errorObj.status === 429 && attempts < maxAttempts) {
          console.log(
            `Rate limited on ${view.id}, waiting 25s before retry (attempt ${attempts}/${maxAttempts})...`
          );
          await new Promise((resolve) => setTimeout(resolve, 25000));
        } else {
          console.error(
            `Error generating ${view.id} view (attempt ${attempts}):`,
            error
          );
          break;
        }
      }
    }

    if (result) {
      results.push(result);
      console.log(`✓ ${view.id} view generated successfully`);
    } else {
      console.warn(
        `✗ Failed to generate ${view.id} view after ${attempts} attempts`
      );
    }

    // Wait 8 seconds between requests to avoid rate limits (free tier is ~2 requests/min)
    if (i < views.length - 1) {
      console.log(`Waiting 8s before next view...`);
      await new Promise((resolve) => setTimeout(resolve, 8000));
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const rawId = session?.user?.id;
    const userId = rawId ? Number(rawId) : NaN;

    if (!Number.isFinite(userId)) {
      return NextResponse.json(
        {
          error: "No autorizado. Inicia sesión para usar el probador virtual.",
        },
        { status: 401 }
      );
    }

    // Validate API key
    if (!GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_STUDIO_API_KEY is not configured");
      return NextResponse.json(
        { error: "Servicio de IA no configurado correctamente." },
        { status: 500 }
      );
    }

    // Parse request body
    const body = (await request.json()) as TryOnRequestBody;
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Se requiere el ID del producto." },
        { status: 400 }
      );
    }

    const [avatarRows] = await db.query<AvatarRow[]>(
      "SELECT imagen_avatar FROM usuario_avatar WHERE usuario_id = ? LIMIT 1",
      [userId]
    );

    if (
      !avatarRows ||
      avatarRows.length === 0 ||
      !avatarRows[0].imagen_avatar
    ) {
      return NextResponse.json(
        {
          error:
            "No tienes un avatar guardado. Por favor, crea tu avatar virtual primero.",
        },
        { status: 400 }
      );
    }

    const avatarImageUrl = avatarRows[0].imagen_avatar;

    // Fetch product image from database
    const [productRows] = await db.query<ProductRow[]>(
      "SELECT pe.imagen_producto, p.nombre FROM producto_especifico pe JOIN producto p ON p.id = pe.id_producto WHERE pe.id = ? LIMIT 1",
      [productId]
    );

    if (
      !productRows ||
      productRows.length === 0 ||
      !productRows[0].imagen_producto
    ) {
      return NextResponse.json(
        { error: "El producto no tiene imagen disponible." },
        { status: 400 }
      );
    }

    const productImageUrl = productRows[0].imagen_producto;
    const productName = productRows[0].nombre || "prenda";

    // Fetch and convert images to base64
    const [avatarData, productData] = await Promise.all([
      fetchImageAsBase64(avatarImageUrl),
      fetchImageAsBase64(productImageUrl),
    ]);

    // Generate try-on images using Gemini 2.5
    const generatedViews = await generateTryOnWithGemini(
      avatarData.base64,
      avatarData.mimeType,
      productData.base64,
      productData.mimeType,
      productName
    );

    if (generatedViews.length === 0) {
      return NextResponse.json(
        { error: "No se pudieron generar las imágenes. Intenta nuevamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      views: generatedViews,
      message: `Se generaron ${generatedViews.length} vistas del probador virtual.`,
    });
  } catch (error) {
    console.error("Virtual try-on error:", error);

    const message =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      { error: `Error al generar el probador virtual: ${message}` },
      { status: 500 }
    );
  }
}
