"use client";

import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitChatQuery } from "@/lib/queries/chat";

type ChatInputProps = {
  placeholder?: string;
  disabled?: boolean;
};

export const ChatInput = ({
  placeholder = "Ask a question about your documents…",
  disabled = false,
}: ChatInputProps) => {
  const [question, setQuestion] = useState("");
  const {
    mutateAsync: submitChatQuery,
    isPending,
    error,
  } = useSubmitChatQuery();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    try {
      await submitChatQuery(trimmed);
      setQuestion("");
    } catch {
      // Errors surface via mutation state; keep input for retry.
    }
  };

  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-3 rounded-full border border-border bg-card p-2 pl-5 shadow-search"
      >
        <Search
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={placeholder}
          disabled={disabled || isPending}
          className="h-11 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          aria-label="Question"
        />
        <Button
          type="submit"
          size="lg"
          disabled={disabled || isPending || question.trim().length === 0}
          className="shrink-0 rounded-full px-5 font-semibold"
        >
          Ask
        </Button>
      </form>
      {errorMessage ? (
        <p className="mt-3 text-center text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};
