import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handleRouteError";
import { deleteDocument } from "@/lib/data/documents";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const DELETE = async (_request: Request, context: RouteContext) => {
  const { id } = await context.params;

  try {
    await deleteDocument(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, "Failed to delete document.");
  }
};
