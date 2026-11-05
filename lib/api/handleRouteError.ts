import { NextResponse } from "next/server";

import { AuthError, PayloadError } from "@/lib/supabase/server";

const isPrerenderInterruptedError = (error: unknown) =>
  error instanceof Error &&
  "digest" in error &&
  (error as Error & { digest?: string }).digest === "NEXT_PRERENDER_INTERRUPTED";

export const handleRouteError = (error: unknown, fallbackMessage: string) => {
  if (isPrerenderInterruptedError(error)) {
    throw error;
  }

  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof PayloadError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return NextResponse.json(
      { error: "Processing timed out — try a smaller file." },
      { status: 504 },
    );
  }

  if (error instanceof Error) {
    if (
      error.message.toLowerCase().includes("timeout") ||
      error.message.toLowerCase().includes("timed out")
    ) {
      return NextResponse.json(
        { error: "Processing timed out — try a smaller file." },
        { status: 504 },
      );
    }
    if (error.message === "Unsupported file type.") {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    if (error.message === "No readable text found in this file.") {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    const lowerMessage = error.message.toLowerCase();
    if (
      lowerMessage.includes("quota") ||
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("resource exhausted")
    ) {
      return NextResponse.json(
        {
          error:
            "Embedding API quota exceeded. Check Gemini API rate limits in Google AI Studio or try again later.",
        },
        { status: 503 },
      );
    }

    console.error(error);
    return NextResponse.json({ error: fallbackMessage }, { status: 500 });
  }

  console.error(error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
};
