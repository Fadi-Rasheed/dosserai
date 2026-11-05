import "server-only";

import type { AcceptedUploadType } from "@/lib/types";

import { extractDocxText } from "@/lib/parsers/docx";
import { extractImageText } from "@/lib/parsers/image";
import { extractPdfText } from "@/lib/parsers/pdf";
import { extractMarkdownText, extractPlainText } from "@/lib/parsers/text";

const extensionToKind: Record<string, "pdf" | "docx" | "text" | "markdown" | "image"> = {
  ".pdf": "pdf",
  ".docx": "docx",
  ".txt": "text",
  ".md": "markdown",
  ".markdown": "markdown",
  ".png": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".webp": "image",
};

const mimeByKind: Record<
  "pdf" | "docx" | "text" | "markdown" | "image",
  AcceptedUploadType[]
> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  text: ["text/plain"],
  markdown: ["text/markdown", "text/plain"],
  image: ["image/png", "image/jpeg", "image/webp"],
};

const getFileExtension = (filename: string) => {
  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return filename.slice(dotIndex).toLowerCase();
};

export const extractText = async (file: File): Promise<string> => {
  const extension = getFileExtension(file.name);
  const kind = extensionToKind[extension];

  if (!kind) {
    throw new Error("Unsupported file type.");
  }

  const allowedMimes = mimeByKind[kind];

  if (file.type && !allowedMimes.includes(file.type as AcceptedUploadType)) {
    throw new Error("Unsupported file type.");
  }

  const buffer = await file.arrayBuffer();

  let text = "";

  switch (kind) {
    case "pdf":
      text = await extractPdfText(buffer);
      break;
    case "docx":
      text = await extractDocxText(buffer);
      break;
    case "text":
      text = extractPlainText(buffer);
      break;
    case "markdown":
      text = extractMarkdownText(buffer);
      break;
    case "image":
      text = await extractImageText(buffer, file.type || "image/png");
      break;
  }

  if (!text) {
    throw new Error("No readable text found in this file.");
  }

  return text;
};
