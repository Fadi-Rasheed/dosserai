import "server-only";

import Groq from "groq-sdk";

const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  return new Groq({ apiKey });
};

export const extractImageText = async (
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<string> => {
  const client = getGroqClient();
  const base64 = Buffer.from(buffer).toString("base64");

  const response = await client.chat.completions.create(
    {
      model: GROQ_VISION_MODEL,
      temperature: 0,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all readable text from this image. Return only the extracted text with no commentary.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    },
    { signal: AbortSignal.timeout(45_000) },
  );

  const text = response.choices[0]?.message?.content?.trim();

  return text ?? "";
};
