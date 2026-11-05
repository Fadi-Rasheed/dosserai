import "server-only";

import { CHUNK_OVERLAP_TOKENS, CHUNK_SIZE_TOKENS } from "@/lib/config";

export type TextChunk = {
  content: string;
  chunkIndex: number;
  metadata: Record<string, unknown>;
};

const CHARS_PER_TOKEN = 4;

const toCharLimit = (tokens: number) => tokens * CHARS_PER_TOKEN;

const splitIntoParagraphs = (text: string) => {
  return text
   .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
};

const splitLongParagraph = (paragraph: string, maxChars: number) => {
  const sentences = paragraph.match(/[^.!?]+[.!?]+|\S+/g) ?? [paragraph];
  const parts: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();

    if (!trimmed) {
      continue;
    }

    if ((current + " " + trimmed).trim().length <= maxChars) {
      current = `${current} ${trimmed}`.trim();
      continue;
    }

    if (current) {
      parts.push(current);
    }

    if (trimmed.length <= maxChars) {
      current = trimmed;
      continue;
    }

    for (let index = 0; index < trimmed.length; index += maxChars) {
      parts.push(trimmed.slice(index, index + maxChars));
    }

    current = "";
  }

  if (current) {
    parts.push(current);
  }

  return parts;
};

export const chunkText = (text: string): TextChunk[] => {
  const maxChars = toCharLimit(CHUNK_SIZE_TOKENS);
  const overlapChars = toCharLimit(CHUNK_OVERLAP_TOKENS);
  const units = splitIntoParagraphs(text).flatMap((paragraph) =>
    paragraph.length > maxChars
      ? splitLongParagraph(paragraph, maxChars)
      : [paragraph],
  );

  if (units.length === 0) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let current = "";
  let chunkIndex = 0;

  const pushChunk = (content: string) => {
    const normalized = content.trim();

    if (!normalized) {
      return;
    }

    chunks.push({
      content: normalized,
      chunkIndex,
      metadata: {},
    });
    chunkIndex += 1;
  };

  for (const unit of units) {
    if ((current + "\n\n" + unit).trim().length <= maxChars) {
      current = current ? `${current}\n\n${unit}` : unit;
      continue;
    }

    pushChunk(current);

    if (overlapChars > 0 && current.length > overlapChars) {
      current = current.slice(-overlapChars).trim();
      current = current ? `${current}\n\n${unit}` : unit;
    } else {
      current = unit;
    }
  }

  pushChunk(current);

  return chunks;
};
