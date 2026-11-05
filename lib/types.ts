export type DocumentSummary = {
  id: string;
  filename: string;
  uploadedAt: string;
  relatedCount?: number;
};

export type DocumentsPage = {
  documents: DocumentSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DocumentConnection = {
  id: string;
  filename: string;
  similarity: number;
};

export type SourceCitation = {
  documentId: string;
  filename: string;
  chunkIndex: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  connections?: DocumentConnection[];
};

export type UsageSummary = {
  queriesToday: number;
  dailyLimit: number;
};

export type AcceptedUploadType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain"
  | "text/markdown"
  | "image/png"
  | "image/jpeg"
  | "image/webp";
