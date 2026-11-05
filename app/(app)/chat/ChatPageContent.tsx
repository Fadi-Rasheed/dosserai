import { ChatComposer, ChatHistoryPanel } from "@/components/chat";
import { PageHeader } from "@/components/shared";
import { getChatHistory } from "@/lib/data/chat";
import { getDocuments } from "@/lib/data/documents";
import { getUsageSummary } from "@/lib/data/usage";

export const ChatPageFallback = () => {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col"
      aria-busy="true"
      aria-label="Loading chat"
    >
      <div className="px-6 pt-8 sm:px-10">
        <PageHeader
          title="Chat"
          description="Query your archive in plain language. Answers are grounded in your documents with source citations."
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 py-8 sm:px-10">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    </main>
  );
};

export const ChatPageContent = async () => {
  const [messages, documents, usage] = await Promise.all([
    getChatHistory(),
    getDocuments(),
    getUsageSummary(),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="px-6 pt-8 sm:px-10">
        <PageHeader
          title="Chat"
          description="Query your archive in plain language. Answers are grounded in your documents with source citations."
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col pb-24 lg:pb-0">
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
          <ChatHistoryPanel initialMessages={messages} />
        </div>

        <ChatComposer initialDocuments={documents} initialUsage={usage} />
      </div>
    </main>
  );
};
