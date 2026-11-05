import "server-only";

import {
  DOCUMENTS_PAGE_SIZE,
  getDailyUploadLimit,
  getHourlyUploadLimit,
  MAX_CHUNKS_PER_DOCUMENT,
  MAX_UPLOAD_BYTES,
} from "@/lib/config";
import { upsertDocConnections } from "@/lib/data/connections";
import { extractText } from "@/lib/parsers";
import { chunkText } from "@/lib/rag/chunk";
import { embedTexts, formatEmbedding } from "@/lib/rag/embed";
import { summarizeDocument } from "@/lib/rag/generate";
import {
  createSupabaseServiceClient,
  getAuthenticatedUser,
  PayloadError,
} from "@/lib/supabase/server";
import type { DocumentSummary, DocumentsPage } from "@/lib/types";

type DocumentRow = {
  id: string;
  filename: string;
  uploaded_at: string;
  doc_connections: Array<{ count: number }> | null;
};

const getStartOfDayIso = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
};

const getOneHourAgoIso = () => {
  return new Date(Date.now() - 60 * 60 * 1000).toISOString();
};

const assertUploadRateLimits = async () => {
  const { supabase } = await getAuthenticatedUser();
  const dailyLimit = getDailyUploadLimit();
  const hourlyLimit = getHourlyUploadLimit();

  const [{ count: dailyCount, error: dailyError }, { count: hourlyCount, error: hourlyError }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .gte("uploaded_at", getStartOfDayIso()),
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .gte("uploaded_at", getOneHourAgoIso()),
    ]);

  if (dailyError) {
    throw new Error(dailyError.message);
  }

  if (hourlyError) {
    throw new Error(hourlyError.message);
  }

  if ((dailyCount ?? 0) >= dailyLimit) {
    throw new PayloadError(429, "Daily upload limit reached.");
  }

  if ((hourlyCount ?? 0) >= hourlyLimit) {
    throw new PayloadError(429, "Hourly upload limit reached.");
  }
};

export const getDocuments = async (): Promise<DocumentSummary[]> => {
  const { supabase } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, filename, uploaded_at, doc_connections!doc_id(count)",
    )
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return mapDocumentRows((data ?? []) as DocumentRow[]);
};

const mapDocumentRows = (rows: DocumentRow[]): DocumentSummary[] =>
  rows.map((document) => ({
    id: document.id,
    filename: document.filename,
    uploadedAt: document.uploaded_at,
    relatedCount: document.doc_connections?.[0]?.count ?? 0,
  }));

export const getDocumentsPage = async (
  requestedPage: number,
): Promise<DocumentsPage> => {
  const { supabase } = await getAuthenticatedUser();
  const pageSize = DOCUMENTS_PAGE_SIZE;
  const safePage = Math.max(1, requestedPage);

  const { count, error: countError } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new Error(countError.message);
  }

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const page =
    totalPages === 0 ? 1 : Math.min(safePage, totalPages);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, filename, uploaded_at, doc_connections!doc_id(count)",
    )
    .order("uploaded_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    documents: mapDocumentRows((data ?? []) as DocumentRow[]),
    total,
    page,
    pageSize,
    totalPages,
  };
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  const { supabase } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    throw new Error(error.message);
  }
};

export const uploadDocument = async (file: File): Promise<{ id: string }> => {
  const startedAt = Date.now();
  const { user } = await getAuthenticatedUser();
  const service = createSupabaseServiceClient();

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new PayloadError(413, "File exceeds the 10 MB upload limit.");
  }

  await assertUploadRateLimits();

  const text = await extractText(file);
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    throw new PayloadError(422, "No readable text found in this file.");
  }

  if (chunks.length > MAX_CHUNKS_PER_DOCUMENT) {
    throw new PayloadError(
      413,
      `Document produces too many chunks (${chunks.length}). Try a smaller or shorter file.`,
    );
  }

  const [chunkEmbeddings, summary] = await Promise.all([
    embedTexts(chunks.map((chunk) => chunk.content)),
    summarizeDocument(text, file.name),
  ]);

  const [summaryEmbedding] = await embedTexts([summary]);

  const { data: document, error: documentError } = await service
    .from("documents")
    .insert({
      user_id: user.id,
      filename: file.name,
      summary,
      summary_embedding: formatEmbedding(summaryEmbedding),
    })
    .select("id")
    .single();

  if (documentError || !document) {
    throw new Error(documentError?.message ?? "Failed to save document.");
  }

  const chunkRows = chunks.map((chunk, index) => ({
    user_id: user.id,
    doc_id: document.id,
    content: chunk.content,
    embedding: formatEmbedding(chunkEmbeddings[index]),
    chunk_index: chunk.chunkIndex,
    metadata: chunk.metadata,
  }));

  const { error: chunksError } = await service.from("chunks").insert(chunkRows);

  if (chunksError) {
    await service.from("documents").delete().eq("id", document.id);
    throw new Error(chunksError.message);
  }

  await upsertDocConnections(
    service,
    user.id,
    document.id,
    summaryEmbedding,
  );

  console.info(
    JSON.stringify({
      step: "upload",
      docId: document.id,
      filename: file.name,
      chunkCount: chunks.length,
      durationMs: Date.now() - startedAt,
    }),
  );

  return { id: document.id };
};
