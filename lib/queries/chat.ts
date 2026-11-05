"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchChatHistory,
  submitChatQuery as submitChatQueryRequest,
} from "@/lib/api/chat";
import { queryKeys } from "@/lib/queries/keys";
import type { ChatMessage } from "@/lib/types";

export const useChatHistory = (initialData?: ChatMessage[]) => {
  return useQuery({
    queryKey: queryKeys.chat.history(),
    queryFn: fetchChatHistory,
    initialData,
  });
};

export const useSubmitChatQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitChatQueryRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.history() });
      queryClient.invalidateQueries({ queryKey: queryKeys.usage.summary() });
    },
  });
};
