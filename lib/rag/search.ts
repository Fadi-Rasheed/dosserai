import "server-only";

import { MIN_CHUNK_SIMILARITY } from "@/lib/config";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RetrievedChunk = {
  id: string;
  docId: string;
  content: string;
  chunkIndex: number;
  similarity: number;
};

export const cosineSimilarity = (left: number[], right: number[]) => {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dotProduct += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

export const searchChunks = async (
  supabase: SupabaseClient,
  embedding: number[],
  topK: number,
): Promise<RetrievedChunk[]> => {
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: `[${embedding.join(",")}]`,
    match_count: topK,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<{
    id: string;
    doc_id: string;
    content: string;
    chunk_index: number;
    similarity: number;
  }>)
    .filter((row) => row.similarity >= MIN_CHUNK_SIMILARITY)
    .map((row) => ({
      id: row.id,
      docId: row.doc_id,
      content: row.content,
      chunkIndex: row.chunk_index,
      similarity: row.similarity,
    }));
};

export const rerankChunks = (
  chunks: RetrievedChunk[],
  limit: number,
): RetrievedChunk[] => {
  if (chunks.length === 0) {
    return [];
  }

  const sorted = [...chunks].sort(
    (left, right) => right.similarity - left.similarity,
  );

  const byDoc = new Map<string, RetrievedChunk[]>();

  for (const chunk of sorted) {
    const existing = byDoc.get(chunk.docId) ?? [];
    existing.push(chunk);
    byDoc.set(chunk.docId, existing);
  }

  const docIds = [...byDoc.keys()];
  const result: RetrievedChunk[] = [];
  let round = 0;

  while (result.length < limit) {
    let added = false;

    for (const docId of docIds) {
      const docChunks = byDoc.get(docId) ?? [];
      const chunk = docChunks[round];

      if (chunk) {
        result.push(chunk);
        added = true;

        if (result.length >= limit) {
          break;
        }
      }
    }

    if (!added) {
      break;
    }

    round += 1;
  }

  return result;
};
