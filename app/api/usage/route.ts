import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api/handleRouteError";
import { getUsageSummary } from "@/lib/data/usage";

export const GET = async () => {
  try {
    const usage = await getUsageSummary();
    return NextResponse.json(usage);
  } catch (error) {
    return handleRouteError(error, "Failed to load usage.");
  }
};
