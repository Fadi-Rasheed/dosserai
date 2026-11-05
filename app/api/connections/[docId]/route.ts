import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handleRouteError";
import { getDocumentConnections } from "@/lib/data/connections";

type RouteContext = {
  params: Promise<{ docId: string }>;
};

export const GET = async (_request: Request, context: RouteContext) => {
  const { docId } = await context.params;

  try {
    const connections = await getDocumentConnections(docId);
    return NextResponse.json({ connections });
  } catch (error) {
    return handleRouteError(error, "Failed to load document connections.");
  }
};
