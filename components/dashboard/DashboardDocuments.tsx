"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { EmptyState } from "@/components/shared";
import { ConnectionGraph } from "./ConnectionGraph";
import { DocumentListItem } from "./DocumentListItem";
import { DocumentsPagination } from "./DocumentsPagination";
import { buttonVariants } from "@/components/ui/button";
import {
  useDocumentConnections,
  useDocumentsPage,
} from "@/lib/queries/documents";
import type { DocumentConnection, DocumentsPage } from "@/lib/types";

type DashboardDocumentsProps = {
  initialPage: number;
  initialDocumentsPage: DocumentsPage;
  initialConnections: DocumentConnection[];
};

export const DashboardDocuments = ({
  initialPage,
  initialDocumentsPage,
  initialConnections,
}: DashboardDocumentsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const parsedPage = Number.parseInt(pageParam ?? String(initialPage), 10);
  const currentPage = Number.isFinite(parsedPage) ? parsedPage : initialPage;

  const { data: documentsPage = initialDocumentsPage, isFetching } =
    useDocumentsPage(currentPage, initialDocumentsPage);

  const { documents, total, totalPages, page } = documentsPage;
  const featuredDocument = documents[0];
  const { data: connections = initialConnections } = useDocumentConnections(
    featuredDocument?.id ?? "",
    initialConnections,
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }

      const query = params.toString();
      router.push(query ? `/dashboard?${query}` : "/dashboard");
    },
    [router, searchParams],
  );

  const handleDocumentDeleted = useCallback(() => {
    if (documents.length === 1 && page > 1) {
      goToPage(page - 1);
    }
  }, [documents.length, goToPage, page]);

  if (total === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Upload PDFs, DOCX, text, Markdown, or scanned images to build your searchable archive."
        action={
          <Link
            href="/upload"
            className={buttonVariants({
              size: "lg",
              className: "rounded-full px-5 font-semibold",
            })}
          >
            Upload your first file
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8 lg:flex-row">
      <section className="min-w-0 flex-1">
        <ul className="flex flex-col gap-3">
          {documents.map((document) => (
            <li key={document.id}>
              <DocumentListItem
                document={document}
                onDeleted={handleDocumentDeleted}
              />
            </li>
          ))}
        </ul>

        <DocumentsPagination
          page={page}
          totalPages={totalPages}
          disabled={isFetching}
          onPageChange={goToPage}
        />
      </section>

      {featuredDocument && connections.length > 0 ? (
        <aside className="w-full shrink-0 lg:w-80">
          <ConnectionGraph
            documentFilename={featuredDocument.filename}
            connections={connections}
          />
        </aside>
      ) : null}
    </div>
  );
};
