"use client";

import { FileUp, Upload, X } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import classNames from "classnames";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { MAX_UPLOAD_BYTES } from "@/lib/config";
import { formatFileSize } from "@/lib/format";
import { useUploadDocument } from "@/lib/queries/documents";

const acceptedExtensions = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const acceptAttribute = acceptedExtensions.join(",");

const getFileExtension = (filename: string) => {
  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return filename.slice(dotIndex).toLowerCase();
};

const isSupportedFile = (file: File) => {
  const extension = getFileExtension(file.name);
  return acceptedExtensions.includes(extension);
};

type SelectedFile = {
  id: string;
  file: File;
};

export const UploadDropzone = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadDocument = useUploadDocument();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const addFiles = (files: FileList | File[]) => {
    const rejectedMessages: string[] = [];
    const validFiles: SelectedFile[] = [];

    for (const file of Array.from(files)) {
      if (!isSupportedFile(file)) {
        rejectedMessages.push(`${file.name}: unsupported file type.`);
        continue;
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        rejectedMessages.push(
          `${file.name}: exceeds the ${formatFileSize(MAX_UPLOAD_BYTES)} limit.`,
        );
        continue;
      }

      validFiles.push({
        id: `${file.name}-${file.lastModified}`,
        file,
      });
    }

    if (rejectedMessages.length > 0) {
      setErrorMessage(rejectedMessages.join(" "));
    }

    if (validFiles.length === 0) {
      return;
    }

    setSelectedFiles((current) => {
      const existingIds = new Set(current.map((entry) => entry.id));
      const uniqueNext = validFiles.filter(
        (entry) => !existingIds.has(entry.id),
      );
      return [...current, ...uniqueNext];
    });

    if (rejectedMessages.length === 0) {
      setErrorMessage(null);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      addFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles((current) =>
      current.filter((entry) => entry.id !== fileId),
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    setErrorMessage(null);
    setUploadErrors([]);

    const failures: string[] = [];
    const succeededIds: string[] = [];

    for (const entry of selectedFiles) {
      try {
        await uploadDocument.mutateAsync(entry.file);
        succeededIds.push(entry.id);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Upload failed.";
        failures.push(`${entry.file.name}: ${message}`);
      }
    }

    if (succeededIds.length > 0) {
      setSelectedFiles((current) =>
        current.filter((entry) => !succeededIds.includes(entry.id)),
      );
    }

    if (failures.length > 0) {
      setUploadErrors(failures);
    }
  };

  const isUploading = uploadDocument.isPending;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card
        className={classNames(
          "border-dashed shadow-lift transition-colors",
          isDragging && "border-primary bg-secondary/60",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardHeader className="items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-foreground">
            <Upload className="size-7" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Drop files here
            </CardTitle>
            <CardDescription className="text-base leading-6">
              Originals are processed in memory and never stored. Only extracted
              text and embeddings persist. Max{" "}
              {formatFileSize(MAX_UPLOAD_BYTES)} per file.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptAttribute}
            className="sr-only"
            onChange={handleInputChange}
          />
          <Button
            type="button"
            size="lg"
            className="rounded-full px-6 font-semibold"
            disabled={isUploading}
            onClick={handleBrowseClick}
          >
            Browse files
          </Button>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 ? (
        <Card className="shadow-lift">
          <CardHeader className="gap-1">
            <CardTitle className="text-lg font-semibold">
              Ready to ingest
            </CardTitle>
            <CardDescription>
              {selectedFiles.length} file
              {selectedFiles.length === 1 ? "" : "s"} selected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <ul className="flex flex-col gap-2">
              {selectedFiles.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
                >
                  <FileUp
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(entry.file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${entry.file.name}`}
                    disabled={isUploading}
                    onClick={() => handleRemoveFile(entry.id)}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            {errorMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}
            {uploadErrors.length > 0 ? (
              <ul className="space-y-1 text-sm text-destructive" role="alert">
                {uploadErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}
            <Button
              type="button"
              size="lg"
              className="w-full rounded-full font-semibold"
              disabled={isUploading}
              onClick={handleUpload}
            >
              {isUploading ? "Uploading…" : "Upload and extract"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
