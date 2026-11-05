"use client";

import { FileText, Link2 } from "lucide-react";
import classNames from "classnames";

import type { DocumentSummary } from "@/lib/types";
import { formatUploadDate } from "@/lib/format";

import { DocumentDeleteButton } from "./DocumentDeleteButton";
import { Badge } from "@/components/ui/badge";

type DocumentListItemProps = {
  document: DocumentSummary;
  className?: string;
  onDeleted?: () => void;
};

export const DocumentListItem = ({
  document,
  className,
  onDeleted,
}: DocumentListItemProps) => {
  return (
    <article
      className={classNames(
        "flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm transition-shadow hover:shadow-lift sm:px-5",
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
        <FileText className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-foreground">
          {document.filename}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Uploaded {formatUploadDate(document.uploadedAt)}
        </p>
      </div>

      {document.relatedCount && document.relatedCount > 0 ? (
        <Badge
          variant="secondary"
          className="hidden shrink-0 rounded-full sm:inline-flex"
        >
          <Link2 className="size-3" aria-hidden="true" />
          {document.relatedCount} linked
        </Badge>
      ) : null}

      <DocumentDeleteButton
        documentId={document.id}
        filename={document.filename}
        onDeleted={onDeleted}
      />
    </article>
  );
};
