import "server-only";

import { marked } from "marked";

export const extractPlainText = (buffer: ArrayBuffer): string => {
  return new TextDecoder("utf-8").decode(buffer).trim();
};

export const extractMarkdownText = (buffer: ArrayBuffer): string => {
  const markdown = new TextDecoder("utf-8").decode(buffer);
  const html = marked.parse(markdown, { async: false }) as string;
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};
