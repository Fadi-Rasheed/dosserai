import "server-only";

// pdf-parse/worker polyfills DOMMatrix via @napi-rs/canvas and must load before pdf-parse.
// Loaded lazily so routes that only read documents never evaluate pdf.js.
const loadPdfParse = async () => {
  const { CanvasFactory, getPath } = await import("pdf-parse/worker");
  const { PDFParse } = await import("pdf-parse");

  PDFParse.setWorker(getPath());

  return { CanvasFactory, PDFParse };
};

export const extractPdfText = async (buffer: ArrayBuffer): Promise<string> => {
  const { CanvasFactory, PDFParse } = await loadPdfParse();
  const parser = new PDFParse({ data: new Uint8Array(buffer), CanvasFactory });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
};
