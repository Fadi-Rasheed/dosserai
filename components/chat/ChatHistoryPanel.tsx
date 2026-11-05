"use client";

import { MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { ChatMessageList } from "./ChatMessageList";
import { useChatHistory, useSubmitChatQuery } from "@/lib/queries/chat";
import type { ChatMessage } from "@/lib/types";

type ChatHistoryPanelProps = {
  initialMessages: ChatMessage[];
};

export const ChatHistoryPanel = ({
  initialMessages,
}: ChatHistoryPanelProps) => {
  const { data: messages = initialMessages } = useChatHistory(initialMessages);
  const { isPending } = useSubmitChatQuery();

  if (messages.length === 0 && !isPending) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Start a conversation"
        description="Ask anything about your uploaded documents. Every answer cites the exact passage it came from."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ChatMessageList messages={messages} />
      {isPending ? (
        <article className="flex justify-start">
          <Card className="max-w-2xl rounded-2xl rounded-bl-md p-5 shadow-lift">
            <p className="text-sm font-semibold text-muted-foreground">
              Answer
            </p>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              Searching your documents…
            </p>
          </Card>
        </article>
      ) : null}
    </div>
  );
};
