import "server-only";

import { CONTEXT_TOP_K, SEARCH_TOP_K } from "@/lib/config";
import { incrementUsage } from "@/lib/data/usage";
import { embedTexts } from "@/lib/rag/embed";
import { generateGroundedAnswer } from "@/lib/rag/generate";
import {
  rerankChunks,
  searchChunks,
  type RetrievedChunk,
} from "@/lib/rag/search";
import {
  createSupabaseServiceClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import type {
  ChatMessage,
  DocumentConnection,
  SourceCitation,
} from "@/lib/types";

type MessageRow = {
  id: string;
  role: string;
  content: string;
  sources: unknown;
};

type StoredAssistantSources = {
  citations?: SourceCitation[];
  connections?: DocumentConnection[];
};

const NO_CONTEXT_ANSWER =
  "I couldn't find relevant information in your documents to answer that question.";

const parseMessageSources = (
  role: string,
  sources: unknown,
): Pick<ChatMessage, "sources" | "connections"> => {
  if (role !== "assistant" || !sources || typeof sources !== "object") {
    return {};
  }

  const stored = sources as StoredAssistantSources;

  return {
    sources: stored.citations ?? [],
    connections: stored.connections ?? [],
  };
};

const mapMessageRow = (row: MessageRow): ChatMessage => {
  const parsed = parseMessageSources(row.role, row.sources);

  return {
    id: row.id,
    role: row.role as ChatMessage["role"],
    content: row.content,
    ...parsed,
  };
};

const getConnectionsBetweenDocs = async (
  docIds: string[],
): Promise<DocumentConnection[]> => {
  if (docIds.length < 2) {
    return [];
  }

  const { supabase } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("doc_connections")
    .select("doc_id, related_doc_id, similarity")
    .in("doc_id", docIds)
    .in("related_doc_id", docIds);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const pairs: Array<{
    relatedDocId: string;
    similarity: number;
  }> = [];

  for (const row of data) {
    const docId = row.doc_id as string;
    const relatedDocId = row.related_doc_id as string;
    const pairKey = [docId, relatedDocId].sort().join(":");

    if (seen.has(pairKey)) {
      continue;
    }

    seen.add(pairKey);
    pairs.push({
      relatedDocId,
      similarity: row.similarity as number,
    });
  }

  const relatedIds = [...new Set(pairs.map((pair) => pair.relatedDocId))];
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("id, filename")
    .in("id", relatedIds);

  if (documentsError) {
    throw new Error(documentsError.message);
  }

  const filenameById = new Map(
    (documents ?? []).map((document) => [
      document.id as string,
      document.filename as string,
    ]),
  );

  return pairs
    .map((pair) => {
      const filename = filenameById.get(pair.relatedDocId);

      if (!filename) {
        return null;
      }

      return {
        id: pair.relatedDocId,
        filename,
        similarity: pair.similarity,
      };
    })
    .filter((connection): connection is DocumentConnection => connection !== null)
    .sort((left, right) => right.similarity - left.similarity);
};

const buildContext = async (
  chunks: RetrievedChunk[],
): Promise<{
  contextChunks: Array<{
    filename: string;
    chunkIndex: number;
    content: string;
    docId: string;
  }>;
  citations: SourceCitation[];
}> => {
  if (chunks.length === 0) {
    return { contextChunks: [], citations: [] };
  }

  const { supabase } = await getAuthenticatedUser();
  const docIds = [...new Set(chunks.map((chunk) => chunk.docId))];

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, filename")
    .in("id", docIds);

  if (error) {
    throw new Error(error.message);
  }

  const filenameById = new Map(
    (documents ?? []).map((document) => [
      document.id as string,
      document.filename as string,
    ]),
  );

  const contextChunks = chunks
    .map((chunk) => {
      const filename = filenameById.get(chunk.docId);

      if (!filename) {
        return null;
      }

      return {
        filename,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        docId: chunk.docId,
      };
    })
    .filter(
      (
        chunk,
      ): chunk is {
        filename: string;
        chunkIndex: number;
        content: string;
        docId: string;
      } => chunk !== null,
    );

  const citations: SourceCitation[] = contextChunks.map((chunk) => ({
    documentId: chunk.docId,
    filename: chunk.filename,
    chunkIndex: chunk.chunkIndex,
  }));

  return { contextChunks, citations };
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  const { supabase } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, sources")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as MessageRow[]).map(mapMessageRow);
};

export const submitChatQuery = async (
  question: string,
): Promise<ChatMessage> => {
  const startedAt = Date.now();
  const { supabase, user } = await getAuthenticatedUser();
  const service = createSupabaseServiceClient();

  await incrementUsage();

  const [questionEmbedding] = await embedTexts([question], "retrieval_query");
  const retrieved = await searchChunks(supabase, questionEmbedding, SEARCH_TOP_K);
  const ranked = rerankChunks(retrieved, CONTEXT_TOP_K);
  const { contextChunks, citations } = await buildContext(ranked);

  const uniqueDocIds = [...new Set(contextChunks.map((chunk) => chunk.docId))];
  const connections = await getConnectionsBetweenDocs(uniqueDocIds);

  const answer =
    contextChunks.length > 0
      ? await generateGroundedAnswer(
          question,
          contextChunks.map(({ filename, chunkIndex, content }) => ({
            filename,
            chunkIndex,
            content,
          })),
        )
      : NO_CONTEXT_ANSWER;

  const { error: userMessageError } = await service.from("messages").insert({
    user_id: user.id,
    role: "user",
    content: question,
    sources: [],
  });

  if (userMessageError) {
    throw new Error(userMessageError.message);
  }

  const assistantSources = {
    citations,
    connections,
  };

  const { data: assistantMessage, error: assistantMessageError } = await service
    .from("messages")
    .insert({
      user_id: user.id,
      role: "assistant",
      content: answer,
      sources: assistantSources,
    })
    .select("id, role, content, sources")
    .single();

  if (assistantMessageError || !assistantMessage) {
    throw new Error(
      assistantMessageError?.message ?? "Failed to save assistant message.",
    );
  }

  console.info(
    JSON.stringify({
      step: "query",
      chunkCount: contextChunks.length,
      connectionCount: connections.length,
      durationMs: Date.now() - startedAt,
    }),
  );

  const parsed = parseMessageSources(
    assistantMessage.role,
    assistantMessage.sources,
  );

  return {
    id: assistantMessage.id,
    role: "assistant",
    content: answer,
    ...parsed,
  };
};
