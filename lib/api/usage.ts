import { fetchJson } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import type { UsageSummary } from "@/lib/types";

export const fetchUsageSummary = async (): Promise<UsageSummary> => {
  return fetchJson<UsageSummary>(apiRoutes.usage);
};
