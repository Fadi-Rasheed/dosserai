import { Suspense } from "react";

import { ChatPageContent, ChatPageFallback } from "./ChatPageContent";

export const ChatPage = () => {
  return (
    <Suspense fallback={<ChatPageFallback />}>
      <ChatPageContent />
    </Suspense>
  );
};
