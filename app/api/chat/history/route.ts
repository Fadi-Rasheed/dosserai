import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handleRouteError";
import { getChatHistory } from "@/lib/data/chat";

export const GET = async () => {
  try {
    const messages = await getChatHistory();
    return NextResponse.json({ messages });
  } catch (error) {
    return handleRouteError(error, "Failed to load chat history.");
  }
};
