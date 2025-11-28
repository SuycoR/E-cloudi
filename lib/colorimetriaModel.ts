import type { AvatarColorSwatch } from "@/types/avatar";
import {
	extractJsonFromResponses,
	postAzureChatCompletion,
	resolveImageReference,
	type ImageSource,
} from "./azureAiClient";

export interface ColorimetriaResponsePayload {
	temporadaPalette: string | null;
	tonoPiel: string | null;
	subtono: string | null;
	coloresRecomendados: AvatarColorSwatch[];
	coloresEvitar: AvatarColorSwatch[];
}

const FALLBACK_RECOMMENDED: AvatarColorSwatch[] = [
	{ name: "Terracota", hex: "#D96C4D" },
	{ name: "Oliva", hex: "#7A8B4F" },
	{ name: "Mostaza", hex: "#E2B13C" },
	{ name: "Caramelo", hex: "#C08A5C" },
];

const FALLBACK_AVOID: AvatarColorSwatch[] = [
	{ name: "Negro puro", hex: "#050505" },
	{ name: "Gris frío", hex: "#8D99AE" },
	{ name: "Azul hielo", hex: "#B7D0E8" },
];

const SYSTEM_PROMPT = `Eres un asesor profesional en colorimetría personal. Analizas fotografías de cuerpo completo para identificar temporada (primavera, verano, otoño o invierno), tono de piel, subtono y la mejor paleta cromática de ropa. Tu respuesta debe estar en español y priorizar combinaciones realistas para moda femenina y masculina.`;

const USER_PROMPT = `Observa el matiz general de la piel, contraste con cabello y ojos, iluminación y sombras. Devuelve una temporada clásica (Primavera, Verano, Otoño o Invierno), un tono de piel (Claro, Medio, Oscuro, etc.), un subtono (Cálido, Frío, Neutro) y hasta 8 colores recomendados/evitar con nombres breves y códigos HEX válidos.`;

const COLORIMETRIA_SCHEMA = {
	name: "AvatarColorimetria",
	schema: {
		type: "object",
		additionalProperties: false,
		properties: {
			temporadaPalette: { type: ["string", "null"] },
			tonoPiel: { type: ["string", "null"] },
			subtono: { type: ["string", "null"] },
			coloresRecomendados: {
				type: "array",
				minItems: 3,
				maxItems: 8,
				items: colorSchemaItem(),
			},
			coloresEvitar: {
				type: "array",
				minItems: 3,
				maxItems: 8,
				items: colorSchemaItem(),
			},
		},
		required: [
			"temporadaPalette",
			"tonoPiel",
			"subtono",
			"coloresRecomendados",
			"coloresEvitar",
		],
	},
};

type AnalyzeInput = ImageSource & {
	metadata?: Record<string, unknown>;
};

export async function fetchColorimetriaForAvatar(
	input: AnalyzeInput
): Promise<ColorimetriaResponsePayload | null> {
	try {
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
						{
							type: "image_url",
							image_url: { url: imageReference },
						},
					],
				},
			],
			response_format: {
				type: "json_schema",
				json_schema: COLORIMETRIA_SCHEMA,
			},
		});

		const parsed = extractJsonFromResponses<
			Partial<ColorimetriaResponsePayload>
		>(response);
		return normalizeColorimetria(parsed);
	} catch (error) {
		console.warn("Colorimetría IA falló", error);
		return null;
	}
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

function normalizeColorimetria(
	raw?: Partial<ColorimetriaResponsePayload> | null
): ColorimetriaResponsePayload | null {
	if (!raw) {
		return null;
	}

	return {
		temporadaPalette: cleanText(raw.temporadaPalette),
		tonoPiel: cleanText(raw.tonoPiel),
		subtono: cleanText(raw.subtono),
		coloresRecomendados:
			normalizeModelColors(raw.coloresRecomendados) || FALLBACK_RECOMMENDED,
		coloresEvitar:
			normalizeModelColors(raw.coloresEvitar) || FALLBACK_AVOID,
	};
}

function cleanText(value?: string | null) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length ? trimmed : null;
}

function normalizeModelColors(
	raw?: AvatarColorSwatch[] | null
): AvatarColorSwatch[] | null {
	if (!raw || !Array.isArray(raw)) return null;
	const normalized = raw
		.map((color) => ({
			name: color?.name?.trim() || "Color",
			hex: normalizeHex(color?.hex),
		}))
		.filter((color) => color.hex.length > 0);
	return normalized.length ? normalized : null;
}

function normalizeHex(value?: string | null) {
	if (typeof value !== "string") return "";
	const cleaned = value.trim().startsWith("#")
		? value.trim()
		: `#${value.trim()}`;
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleaned) ? cleaned : "";
}

function colorSchemaItem() {
	return {
		type: "object",
		additionalProperties: false,
		properties: {
			name: { type: "string" },
			hex: { type: "string" },
		},
		required: ["name", "hex"],
	};
}
