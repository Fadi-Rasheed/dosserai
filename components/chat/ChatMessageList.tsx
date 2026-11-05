import type { ChatMessage } from "@/lib/types";

import { ChatMessageBubble } from "./ChatMessageBubble";

type ChatMessageListProps = {
  messages: ChatMessage[];
};

export const ChatMessageList = ({ messages }: ChatMessageListProps) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};
