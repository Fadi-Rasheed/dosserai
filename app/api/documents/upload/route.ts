import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handleRouteError";
import { uploadDocument } from "@/lib/data/documents";

// Vercel Hobby max is 60s; raise to 300 on Pro if needed.
export const maxDuration = 60;

export const POST = async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  try {
    const document = await uploadDocument(file);
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Failed to upload document.");
  }
};
