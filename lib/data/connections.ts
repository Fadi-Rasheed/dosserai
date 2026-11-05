import "server-only";

import {
  DOC_CONNECTION_SIMILARITY_THRESHOLD,
  TOP_DOC_CONNECTIONS,
} from "@/lib/config";
import { cosineSimilarity } from "@/lib/rag/search";
import type { DocumentConnection } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type ExistingDocumentEmbedding = {
  id: string;
  filename: string;
  summary_embedding: string | number[] | null;
};

const parseEmbedding = (value: string | number[] | null): number[] | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value;
  }

  const trimmed = value.replace(/^\[/, "").replace(/\]$/, "");

  if (!trimmed) {
    return null;
  }

  return trimmed.split(",").map((part) => Number(part.trim()));
};

export const upsertDocConnections = async (
  supabase: SupabaseClient,
  userId: string,
  docId: string,
  summaryEmbedding: number[],
) => {
  const { data, error } = await supabase
    .from("documents")
    .select("id, filename, summary_embedding")
    .eq("user_id", userId)
    .neq("id", docId)
    .not("summary_embedding", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  const candidates = ((data ?? []) as ExistingDocumentEmbedding[])
    .map((document) => {
      const embedding = parseEmbedding(document.summary_embedding);

      if (!embedding) {
        return null;
      }

      return {
        id: document.id,
        filename: document.filename,
        similarity: cosineSimilarity(summaryEmbedding, embedding),
      };
    })
    .filter(
      (
        candidate,
      ): candidate is { id: string; filename: string; similarity: number } =>
        candidate !== null &&
        candidate.similarity >= DOC_CONNECTION_SIMILARITY_THRESHOLD,
    )
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, TOP_DOC_CONNECTIONS);

  if (candidates.length === 0) {
    return;
  }

  const rows = candidates.flatMap((candidate) => [
    {
      doc_id: docId,
      related_doc_id: candidate.id,
      similarity: candidate.similarity,
    },
    {
      doc_id: candidate.id,
      related_doc_id: docId,
      similarity: candidate.similarity,
    },
  ]);

  const { error: insertError } = await supabase
    .from("doc_connections")
    .upsert(rows, { onConflict: "doc_id,related_doc_id" });

  if (insertError) {
    throw new Error(insertError.message);
  }
};

export const getDocumentConnections = async (
  documentId: string,
): Promise<DocumentConnection[]> => {
  const { getAuthenticatedUser } = await import("@/lib/supabase/server");
  const { supabase } = await getAuthenticatedUser();

  const { data: connections, error } = await supabase
    .from("doc_connections")
    .select("similarity, related_doc_id")
    .eq("doc_id", documentId)
    .order("similarity", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!connections || connections.length === 0) {
    return [];
  }

  const relatedIds = connections.map((row) => row.related_doc_id as string);
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("id, filename")
    .in("id", relatedIds);

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const filenameById = new Map(
    (documents ?? []).map((document) => [document.id as string, document.filename as string]),
  );

  return connections
    .map((row) => {
      const relatedDocId = row.related_doc_id as string;
      const filename = filenameById.get(relatedDocId);

      if (!filename) {
        return null;
      }

      return {
        id: relatedDocId,
        filename,
        similarity: row.similarity as number,
      };
    })
    .filter((connection): connection is DocumentConnection => connection !== null);
};
