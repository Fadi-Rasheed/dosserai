import "server-only";

import { PDFParse } from "pdf-parse";

export const extractPdfText = async (buffer: ArrayBuffer): Promise<string> => {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
};
