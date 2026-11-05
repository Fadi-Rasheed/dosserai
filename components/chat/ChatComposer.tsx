"use client";

import { ChatInput } from "./ChatInput";
import { useDocuments } from "@/lib/queries/documents";
import { useUsageSummary } from "@/lib/queries/usage";
import type { DocumentSummary, UsageSummary } from "@/lib/types";

type ChatComposerProps = {
  initialDocuments: DocumentSummary[];
  initialUsage: UsageSummary;
};

export const ChatComposer = ({
  initialDocuments,
  initialUsage,
}: ChatComposerProps) => {
  const { data: documents = initialDocuments } = useDocuments(initialDocuments);
  const { data: usage = initialUsage } = useUsageSummary(initialUsage);

  const hasDocuments = documents.length > 0;
  const atDailyLimit = usage.queriesToday >= usage.dailyLimit;
  const disabled = !hasDocuments || atDailyLimit;

  return (
    <div className="border-t border-border bg-background px-6 py-5 sm:px-10">
      <ChatInput disabled={disabled} />
      {!hasDocuments ? (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Upload a document first to start querying your archive.
        </p>
      ) : null}
      {hasDocuments && atDailyLimit ? (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Daily query limit reached. Resets at midnight UTC.
        </p>
      ) : null}
    </div>
  );
};
