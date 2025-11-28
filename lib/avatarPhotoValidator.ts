import type { PhotoScore } from "@/types/avatar";
import {
  extractJsonFromResponses,
  postAzureChatCompletion,
  resolveImageReference,
  type ImageSource,
} from "./azureAiClient";

export type AvatarPhotoValidationResult = {
  verdict: "approved" | "rejected";
  confidence: number;
  reasons: string[];
  tips: string[];
  photoScores: PhotoScore[];
};

const SYSTEM_PROMPT = `Eres un evaluador de fotografías enfocado en verificar si la imagen es razonablemente útil para generar un avatar. 
Sé flexible y realista: acepta cualquier foto donde la persona se vea de forma suficiente, incluso si no es perfecta o totalmente frontal.

Solo rechaza imágenes cuando:
- la persona no se distingue,
- hay varias personas,
- hay espejos que confunden la lectura,
- la calidad es extremadamente baja,
- el rostro o el cuerpo están casi totalmente ocultos.

Si la imagen permite reconocer a la persona y entender su forma general, debe considerarse apta.
No exijas perfección de estudio fotográfico ni encuadres estrictos.
`;

const USER_PROMPT = `Evalúa si la imagen es razonablemente útil para generar un avatar, incluso si no es perfecta. 
Acepta fotos donde el rostro o el cuerpo sean suficientemente visibles, aunque haya pequeños recortes, planos a media altura, o iluminación no profesional.
Devuelve puntajes de 0 a 100 para iluminación, nitidez, postura y encuadre.
Si decides rechazar, da motivos concretos y simples, pero no rechaces por detalles menores o por expectativas demasiado altas.
`;

const VALIDATION_SCHEMA = {
  name: "AvatarPhotoValidation",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      verdict: {
        type: "string",
        enum: ["approved", "rejected"],
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
      },
      reasons: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: 6,
      },
      tips: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: 6,
      },
      photoScores: {
        type: "array",
        minItems: 0,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            value: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["label", "value"],
        },
      },
    },
    required: ["verdict", "confidence", "photoScores"],
  },
};

export async function validateAvatarPhoto(input: ImageSource & {
  metadata?: Record<string, unknown>;
}): Promise<AvatarPhotoValidationResult> {
  const imageReference = await resolveImageReference(input);

  const response = await postAzureChatCompletion({
    messages: [
      {
        role: "system",
        content: [{ type: "text", text: SYSTEM_PROMPT }],
      },
      {
        role: "user",
        content: [
          { type: "text", text: buildUserPrompt(input.metadata) },
          { type: "image_url", image_url: { url: imageReference } },
        ],
      },
    ],
    response_format: { type: "json_schema", json_schema: VALIDATION_SCHEMA },
  });

  const parsed = extractJsonFromResponses<AvatarPhotoValidationResult>(response);
  return normalizeValidationResult(parsed);
}

function buildUserPrompt(metadata?: Record<string, unknown>) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return USER_PROMPT;
  }

  const metaLines = Object.entries(metadata)
    .map(([key, value]) => `- ${key}: ${String(value)}`)
    .join("\n");

  return `${USER_PROMPT}\nContexto adicional:\n${metaLines}`;
}

function normalizeValidationResult(
  raw: AvatarPhotoValidationResult
): AvatarPhotoValidationResult {
  const verdict = raw.verdict === "approved" ? "approved" : "rejected";
  const reasons = sanitizeList(raw.reasons);
  const tips = sanitizeList(raw.tips);

  return {
    verdict,
    confidence: clamp(raw.confidence ?? 0.5, 0, 1),
    reasons: verdict === "approved" ? [] : reasons,
    tips: verdict === "approved" ? [] : tips,
    photoScores: normalizeScores(raw.photoScores),
  };
}

function sanitizeList(values?: string[]) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, 6);
}

function normalizeScores(scores?: PhotoScore[]): PhotoScore[] {
  if (!Array.isArray(scores) || !scores.length) {
    return [];
  }

  return scores.map((score) => ({
    label: score?.label?.trim() || "Indicador",
    value: Math.round(clamp(Number(score?.value ?? 0), 0, 100)),
  }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
