export const CHUNK_SIZE_TOKENS = 500;
export const CHUNK_OVERLAP_TOKENS = 100;
export const TOP_DOC_CONNECTIONS = 5;
export const DOC_CONNECTION_SIMILARITY_THRESHOLD = 0.3;
export const SEARCH_TOP_K = 20;
export const CONTEXT_TOP_K = 8;
export const MIN_CHUNK_SIMILARITY = 0.3;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_CHUNKS_PER_DOCUMENT = 200;
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 1536;
export const EMBEDDING_BATCH_SIZE = 32;
export const DOCUMENTS_PAGE_SIZE = 20;

const parsePositiveEnvLimit = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
};

export const getDailyQueryLimit = () => {
  return parsePositiveEnvLimit(process.env.DAILY_QUERY_LIMIT, 50);
};

export const getDailyUploadLimit = () => {
  return parsePositiveEnvLimit(process.env.DAILY_UPLOAD_LIMIT, 20);
};

export const getHourlyUploadLimit = () => {
  return parsePositiveEnvLimit(process.env.HOURLY_UPLOAD_LIMIT, 5);
};
