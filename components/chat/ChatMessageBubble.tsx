import type { ChatMessage } from "@/lib/types";
import { formatSimilarity } from "@/lib/format";

import { SourceCitation } from "./SourceCitation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ChatMessageBubbleProps = {
  message: ChatMessage;
};

export const ChatMessageBubble = ({ message }: ChatMessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <article
      className={
        isUser ? "flex justify-end" : "flex justify-start"
      }
    >
      {isUser ? (
        <Card className="max-w-xl rounded-2xl rounded-br-md bg-primary px-5 py-4 text-primary-foreground shadow-sm">
          <p className="text-base leading-7">{message.content}</p>
        </Card>
      ) : (
        <Card className="max-w-2xl rounded-2xl rounded-bl-md p-5 shadow-lift">
          <p className="text-sm font-semibold text-muted-foreground">Answer</p>
          <p className="mt-2 text-base leading-7 text-foreground">
            {message.content}
          </p>
          {message.sources && message.sources.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {message.sources.map((source) => (
                <li key={`${source.documentId}-${source.chunkIndex}`}>
                  <SourceCitation source={source} />
                </li>
              ))}
            </ul>
          ) : null}
          {message.connections && message.connections.length > 0 ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm font-semibold text-muted-foreground">
                Related documents
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {message.connections.map((connection) => (
                  <li
                    key={connection.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">
                      {connection.filename}
                    </span>
                    <Badge variant="outline" className="shrink-0 rounded-full">
                      {formatSimilarity(connection.similarity)} match
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      )}
    </article>
  );
};
