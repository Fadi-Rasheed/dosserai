"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteDocument as deleteDocumentRequest,
  fetchDocumentConnections,
  fetchDocuments,
  fetchDocumentsPage,
  uploadDocument as uploadDocumentRequest,
} from "@/lib/api/documents";
import { queryKeys } from "@/lib/queries/keys";
import type { DocumentConnection, DocumentSummary, DocumentsPage } from "@/lib/types";

export const useDocuments = (initialData?: DocumentSummary[]) => {
  return useQuery({
    queryKey: queryKeys.documents.list(),
    queryFn: fetchDocuments,
    initialData,
  });
};

export const useDocumentsPage = (
  page: number,
  initialData?: DocumentsPage,
) => {
  return useQuery({
    queryKey: queryKeys.documents.page(page),
    queryFn: () => fetchDocumentsPage(page),
    initialData,
  });
};

export const useDocumentConnections = (
  docId: string,
  initialData?: DocumentConnection[],
) => {
  return useQuery({
    queryKey: queryKeys.documents.connections(docId),
    queryFn: () => fetchDocumentConnections(docId),
    initialData,
    enabled: docId.length > 0,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocumentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocumentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
};
