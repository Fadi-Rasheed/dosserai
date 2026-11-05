import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";

import {
  DashboardDocumentsFallback,
  DashboardDocumentsSection,
} from "./DashboardDocumentsSection";

type DashboardPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  return (
    <main className="flex min-h-0 flex-1 flex-col px-6 py-8 sm:px-10">
      <PageHeader
        title="Dashboard"
        description="Your private archive — filename and upload date only. Original files are never kept."
        actions={
          <Link
            href="/upload"
            className={buttonVariants({
              size: "lg",
              className: "rounded-full px-5 font-semibold",
            })}
          >
            Upload
          </Link>
        }
      />

      <div className="mt-8 flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<DashboardDocumentsFallback />}>
          <DashboardDocumentsSection searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
};
