export const queryKeys = {
  documents: {
    all: ["documents"] as const,
    list: () => [...queryKeys.documents.all, "list"] as const,
    page: (page: number) => [...queryKeys.documents.all, "page", page] as const,
    connections: (docId: string) =>
      [...queryKeys.documents.all, "connections", docId] as const,
  },
  chat: {
    all: ["chat"] as const,
    history: () => [...queryKeys.chat.all, "history"] as const,
  },
  usage: {
    all: ["usage"] as const,
    summary: () => [...queryKeys.usage.all, "summary"] as const,
  },
};
