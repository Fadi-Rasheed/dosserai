"use client";

import { UsageMeter } from "./UsageMeter";
import { useUsageSummary } from "@/lib/queries/usage";
import type { UsageSummary } from "@/lib/types";

type UsageMeterSectionProps = {
  initialUsage: UsageSummary;
};

export const UsageMeterSection = ({
  initialUsage,
}: UsageMeterSectionProps) => {
  const { data: usage = initialUsage } = useUsageSummary(initialUsage);

  return <UsageMeter usage={usage} />;
};
