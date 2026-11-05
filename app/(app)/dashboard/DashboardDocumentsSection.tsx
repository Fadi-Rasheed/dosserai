import { DashboardDocuments } from "@/components/dashboard";
import { getDocumentConnections } from "@/lib/data/connections";
import { getDocumentsPage } from "@/lib/data/documents";

type DashboardDocumentsSectionProps = {
  searchParams: Promise<{ page?: string }>;
};

export const DashboardDocumentsFallback = () => {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-8 lg:flex-row"
      aria-busy="true"
      aria-label="Loading documents"
    >
      <section className="flex min-w-0 flex-1 flex-col gap-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-[4.5rem] animate-pulse rounded-xl bg-muted"
          />
        ))}
      </section>
    </div>
  );
};

export const DashboardDocumentsSection = async ({
  searchParams,
}: DashboardDocumentsSectionProps) => {
  const { page: pageParam } = await searchParams;
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const initialPage = Number.isFinite(parsedPage) ? parsedPage : 1;

  const documentsPage = await getDocumentsPage(initialPage);
  const featuredDocument = documentsPage.documents[0];
  const connections = featuredDocument
    ? await getDocumentConnections(featuredDocument.id)
    : [];

  return (
    <DashboardDocuments
      initialPage={documentsPage.page}
      initialDocumentsPage={documentsPage}
      initialConnections={connections}
    />
  );
};
