import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.0-flash";

interface IncomingMessage {
  role: "assistant" | "user";
  content: string;
}

export async function POST(request: NextRequest) {
  const apiKey =
    process.env.GOOGLE_AI_STUDIO_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta configurar la clave de la API de Google AI Studio." },
      { status: 500 }
    );
  }

  let body: { messages?: IncomingMessage[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el cuerpo de la solicitud." },
      { status: 400 }
    );
  }

  const history = body.messages ?? [];

  if (!Array.isArray(history) || history.length === 0) {
    return NextResponse.json(
      { error: "Debes enviar al menos un mensaje en la conversación." },
      { status: 400 }
    );
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: MODEL_NAME });

    const contents = history.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const result = await model.generateContent({ contents });
    const text = result.response.text();

    if (!text) {
      return NextResponse.json(
        {
          error: "La respuesta del modelo llegó vacía.",
          reply: "Lo siento, ahora mismo no tengo una respuesta disponible.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("[api/chat] Error generando respuesta", error);
    return NextResponse.json(
      {
        error: "Ocurrió un problema al generar la respuesta.",
        reply:
          "Hubo un inconveniente al conectar con el asistente. Intenta nuevamente en un momento.",
      },
      { status: 500 }
    );
  }
}
