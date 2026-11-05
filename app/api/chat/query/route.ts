import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handleRouteError";
import { submitChatQuery } from "@/lib/data/chat";

export const maxDuration = 60;

export const POST = async (request: Request) => {
  const body = (await request.json()) as { question?: string };
  const question = body.question?.trim();

  if (!question) {
    return NextResponse.json(
      { error: "A question is required." },
      { status: 400 },
    );
  }

  try {
    const message = await submitChatQuery(question);
    return NextResponse.json({ message });
  } catch (error) {
    return handleRouteError(error, "Failed to process query.");
  }
};
