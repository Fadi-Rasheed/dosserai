import { fetchJson } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import type { ChatMessage } from "@/lib/types";

type ChatHistoryResponse = {
  messages: ChatMessage[];
};

type ChatQueryResponse = {
  message: ChatMessage;
};

export const fetchChatHistory = async (): Promise<ChatMessage[]> => {
  const data = await fetchJson<ChatHistoryResponse>(apiRoutes.chat.history);
  return data.messages;
};

export const submitChatQuery = async (
  question: string,
): Promise<ChatMessage> => {
  const data = await fetchJson<ChatQueryResponse>(apiRoutes.chat.query, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return data.message;
};
