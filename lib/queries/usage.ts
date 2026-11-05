"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchUsageSummary } from "@/lib/api/usage";
import { queryKeys } from "@/lib/queries/keys";
import type { UsageSummary } from "@/lib/types";

export const useUsageSummary = (initialData?: UsageSummary) => {
  return useQuery({
    queryKey: queryKeys.usage.summary(),
    queryFn: fetchUsageSummary,
    initialData,
  });
};
