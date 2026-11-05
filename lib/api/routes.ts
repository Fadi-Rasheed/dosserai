export const apiRoutes = {
  chat: {
    history: "/api/chat/history",
    query: "/api/chat/query",
  },
  documents: {
    list: "/api/documents/list",
    upload: "/api/documents/upload",
    byId: (id: string) => `/api/documents/${id}`,
  },
  connections: {
    byDocId: (docId: string) => `/api/connections/${docId}`,
  },
  usage: "/api/usage",
} as const;
