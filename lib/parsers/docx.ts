import "server-only";

import mammoth from "mammoth";

export const extractDocxText = async (buffer: ArrayBuffer): Promise<string> => {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
  return result.value.trim();
};
