import { NextResponse, type NextRequest } from "next/server";

import { handleRouteError } from "@/lib/api/handleRouteError";
import { getDocuments, getDocumentsPage } from "@/lib/data/documents";

export const dynamic = "force-dynamic";

export const GET = async (request: NextRequest) => {
  try {
    const pageParam = request.nextUrl.searchParams.get("page");

    if (pageParam !== null) {
      const page = Number.parseInt(pageParam, 10);
      const documentsPage = await getDocumentsPage(
        Number.isFinite(page) ? page : 1,
      );
      return NextResponse.json(documentsPage);
    }

    const documents = await getDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    return handleRouteError(error, "Failed to load documents.");
  }
};
