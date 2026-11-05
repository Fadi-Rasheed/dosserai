"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteDocument } from "@/lib/queries/documents";

type DocumentDeleteButtonProps = {
  documentId: string;
  filename: string;
  onDeleted?: () => void;
};

export const DocumentDeleteButton = ({
  documentId,
  filename,
  onDeleted,
}: DocumentDeleteButtonProps) => {
  const [open, setOpen] = useState(false);
  const deleteDocument = useDeleteDocument();

  const handleConfirmDelete = () => {
    deleteDocument.mutate(documentId, {
      onSuccess: () => {
        setOpen(false);
        onDeleted?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${filename}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete document?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{filename}</span> and
            all of its extracted chunks and embeddings will be permanently
            removed. The original file was never stored.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteDocument.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteDocument.isPending}
            onClick={handleConfirmDelete}
          >
            {deleteDocument.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
