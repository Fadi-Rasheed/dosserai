import { ApiError, fetchJson } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import type { DocumentConnection, DocumentSummary, DocumentsPage } from "@/lib/types";

type DocumentsResponse = {
  documents: DocumentSummary[];
};

type ConnectionsResponse = {
  connections: DocumentConnection[];
};

export const fetchDocuments = async (): Promise<DocumentSummary[]> => {
  const data = await fetchJson<DocumentsResponse>(apiRoutes.documents.list);
  return data.documents;
};

export const fetchDocumentsPage = async (page: number): Promise<DocumentsPage> => {
  const url = `${apiRoutes.documents.list}?page=${page}`;
  return fetchJson<DocumentsPage>(url);
};

export const fetchDocumentConnections = async (
  docId: string,
): Promise<DocumentConnection[]> => {
  const data = await fetchJson<ConnectionsResponse>(
    apiRoutes.connections.byDocId(docId),
  );
  return data.connections;
};

export const uploadDocument = async (file: File): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    return await fetchJson<{ id: string }>(apiRoutes.documents.upload, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(55_000),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 504) {
      throw new ApiError(
        504,
        "Upload timed out — try a smaller file or split the document.",
      );
    }

    throw error;
  }
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await fetchJson<void>(apiRoutes.documents.byId(documentId), {
    method: "DELETE",
  });
};
