import "server-only";

import {
  EMBEDDING_BATCH_SIZE,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
} from "@/lib/config";

const GEMINI_EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents`;

export type EmbedTask = "retrieval_document" | "retrieval_query";

const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return apiKey;
};

const toGeminiTaskType = (task: EmbedTask) => {
  return task === "retrieval_query" ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT";
};

const embedBatch = async (
  texts: string[],
  task: EmbedTask,
): Promise<number[][]> => {
  const startedAt = Date.now();
  const response = await fetch(GEMINI_EMBED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getGeminiApiKey(),
    },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: toGeminiTaskType(task),
      })),
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(payload.error?.message ?? "Failed to create embeddings.");
  }

  const payload = (await response.json()) as {
    embeddings?: Array<{ values?: number[] }>;
  };

  const embeddings = payload.embeddings?.map((item) => item.values ?? []) ?? [];

  if (embeddings.length !== texts.length) {
    throw new Error("Embedding batch returned an unexpected number of vectors.");
  }

  console.info(
    JSON.stringify({
      step: "embed",
      count: texts.length,
      durationMs: Date.now() - startedAt,
    }),
  );

  return embeddings;
};

export const embedTexts = async (
  texts: string[],
  task: EmbedTask = "retrieval_document",
): Promise<number[][]> => {
  if (texts.length === 0) {
    return [];
  }

  const embeddings: number[][] = [];

  for (let index = 0; index < texts.length; index += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(index, index + EMBEDDING_BATCH_SIZE);
    const batchEmbeddings = await embedBatch(batch, task);
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
};

export const formatEmbedding = (embedding: number[]) => {
  return `[${embedding.join(",")}]`;
};
