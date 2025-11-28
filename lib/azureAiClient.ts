import { Buffer } from "node:buffer";

const DEFAULT_MODEL = "gpt-5-nano";
const DEFAULT_API_VERSION = "2024-12-01-preview";

export interface AzureAiConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

export interface ImageSource {
  imageUrl?: string | null;
  imageFile?: File | Blob | null;
}

export function getAzureAiConfig(): AzureAiConfig {
  const apiKey = process.env.CONF_AZURE_API_KEY?.trim() || "";
  const deployment =
    process.env.CONF_AZURE_DEPLOYMENT?.trim() || DEFAULT_MODEL;
  const apiVersion =
    process.env.CONF_API_VERSION?.trim() || DEFAULT_API_VERSION;
  const baseEndpoint = process.env.CONF_AZURE_ENDPOINT?.trim() || "";

  if (!apiKey || !deployment || !baseEndpoint) {
    throw new Error(
      "Colorimetría IA no configurada. Define CONF_AZURE_ENDPOINT, CONF_AZURE_API_KEY, CONF_AZURE_DEPLOYMENT y CONF_API_VERSION en tu entorno."
    );
  }

  const sanitizedBase = baseEndpoint.replace(/\/?$/, "");
  const endpoint = `${sanitizedBase}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  return {
    endpoint,
    apiKey,
    deployment,
    apiVersion,
  };
}

function buildHeaders(apiKey: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  headers["api-key"] = apiKey;

  return headers;
}

export async function postAzureChatCompletion(body: Record<string, unknown>) {
  const config = getAzureAiConfig();
  const headers = buildHeaders(config.apiKey);

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Colorimetría IA falló (${response.status}): ${text}`);
  }

  return response.json();
}

export async function resolveImageReference(source: ImageSource): Promise<string> {
  if (source.imageUrl) {
    return source.imageUrl;
  }

  if (source.imageFile) {
    const buffer = Buffer.from(await source.imageFile.arrayBuffer());
    const mime = source.imageFile.type || "image/jpeg";
    const base64 = buffer.toString("base64");
    return `data:${mime};base64,${base64}`;
  }

  throw new Error("Se requiere una imagen para el análisis de colorimetría");
}

export function extractJsonFromResponses<T = unknown>(payload: any): T {
  if (!payload) {
    throw new Error("La respuesta del modelo llegó vacía");
  }

  const firstChoice = payload.choices?.[0];
  const message = firstChoice?.message;
  if (!message) {
    return payload as T;
  }

  const text = extractMessageText(message);
  if (!text) {
    return payload as T;
  }

  return JSON.parse(text) as T;
}

function extractMessageText(message: any): string | null {
  if (!message) return null;
  const { content } = message;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const textChunk = content.find((chunk) => chunk?.type === "text");
    if (!textChunk) return null;

    if (typeof textChunk.text === "string") {
      return textChunk.text;
    }

    if (Array.isArray(textChunk.text)) {
      return textChunk.text.join("");
    }
  }

  return null;
}
