import "server-only";

import Groq from "groq-sdk";

const SUMMARY_INPUT_CHAR_LIMIT = 12000;

/** Groq free/developer tier; llama-3.3-70b-versatile was retired Aug 2026. */
const GROQ_CHAT_MODEL = "openai/gpt-oss-120b";

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  return new Groq({ apiKey });
};

export const summarizeDocument = async (
  text: string,
  filename: string,
): Promise<string> => {
  const client = getGroqClient();
  const truncatedText = text.slice(0, SUMMARY_INPUT_CHAR_LIMIT);

  const response = await client.chat.completions.create({
    model: GROQ_CHAT_MODEL,
    temperature: 0.2,
    reasoning_effort: "low",
    // gpt-oss is a reasoning model: hidden reasoning tokens count against this budget.
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content:
          "Summarize documents in 2-3 concise sentences. Use only facts present in the source text.",
      },
      {
        role: "user",
        content: `Filename: ${filename}\n\nDocument text:\n${truncatedText}`,
      },
    ],
  });

  const choice = response.choices[0];
  const summary = choice?.message?.content?.trim();

  if (!summary) {
    throw new Error(
      `Failed to generate document summary (finish_reason: ${choice?.finish_reason ?? "none"}).`,
    );
  }

  return summary;
};

export type ContextChunk = {
  filename: string;
  chunkIndex: number;
  content: string;
};

export const generateGroundedAnswer = async (
  question: string,
  contextChunks: ContextChunk[],
): Promise<string> => {
  const startedAt = Date.now();
  const client = getGroqClient();

  const contextBlock = contextChunks
    .map(
      (chunk, index) =>
        `[${index + 1}] ${chunk.filename} (chunk ${chunk.chunkIndex}):\n${chunk.content}`,
    )
    .join("\n\n");

  const response = await client.chat.completions.create({
    model: GROQ_CHAT_MODEL,
    temperature: 0.2,
    reasoning_effort: "low",
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content:
          "You answer questions using only the provided document excerpts. " +
          "If the excerpts do not contain enough information, say so clearly. " +
          "Cite sources inline using [filename, chunk N] format. " +
          "Do not invent facts not present in the context.",
      },
      {
        role: "user",
        content: `Context:\n${contextBlock || "(no relevant excerpts found)"}\n\nQuestion: ${question}`,
      },
    ],
  });

  const choice = response.choices[0];
  const answer = choice?.message?.content?.trim();

  if (!answer) {
    throw new Error(
      `Failed to generate answer (finish_reason: ${choice?.finish_reason ?? "none"}).`,
    );
  }

  console.info(
    JSON.stringify({
      step: "generate",
      chunkCount: contextChunks.length,
      durationMs: Date.now() - startedAt,
    }),
  );

  return answer;
};
