import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env" });

const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_AI_STUDIO_API_KEY no encontrada");
}

const ai = new GoogleGenAI({
  apiKey,
});

async function main() {
  console.log("KEY:", apiKey.slice(0, 10));

  const avatar = fs.readFileSync("avatar.jfif");
  const garment = fs.readFileSync("garment.jfif");

  const MODEL_NAME = "gemini-2.5-flash-image";

  console.log("MODEL:", MODEL_NAME);
  console.log("Enviando solicitud...");

  const response = await ai.models.generateContentStream({
    model: MODEL_NAME,
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: avatar.toString("base64"),
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: garment.toString("base64"),
            },
          },
          {
            text: `
            Virtual Try-On:

            First image = person/avatar.
            Second image = clothing item.

            Put the clothing on the person.

            Requirements:
            - Photorealistic result.
            - Preserve face and body.
            - Natural fit.
            - Professional fashion photography.
            - Return the generated image.
            `,
          },
        ],
      },
    ],
  });

  let imageFound = false;

  for await (const chunk of response) {
    const parts = chunk.candidates?.[0]?.content?.parts;

    if (!parts) {
      continue;
    }

    for (const part of parts) {
      const imagePart = part as {
        inlineData?: {
          data?: string;
          mimeType?: string;
        };
        text?: string;
      };

      if (imagePart.text) {
        console.log("\n=== TEXTO ===");
        console.log(imagePart.text);
      }

      if (imagePart.inlineData?.data) {
        imageFound = true;

        const mimeType =
          imagePart.inlineData.mimeType || "image/png";

        console.log("\n=== IMAGEN RECIBIDA ===");
        console.log("MimeType:", mimeType);

        const extension = mimeType.includes("jpeg")
          ? "jpg"
          : mimeType.includes("webp")
          ? "webp"
          : "png";

        const buffer = Buffer.from(
          imagePart.inlineData.data,
          "base64"
        );

        const outputFile = `resultado.${extension}`;

        fs.writeFileSync(outputFile, buffer);

        console.log(`Imagen guardada en: ${outputFile}`);
      }
    }
  }

  if (!imageFound) {
    console.log("\nNo se encontró ninguna imagen en la respuesta.");
  }
}

main().catch((error) => {
  console.error("\n=== ERROR ===");
  console.error(error);

  if (error instanceof Error) {
    console.error("Mensaje:", error.message);
    console.error("Stack:", error.stack);
  }
});