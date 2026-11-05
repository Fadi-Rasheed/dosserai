import { getUsageSummary } from "@/lib/data/usage";

import { AppMobileHeader } from "./AppMobileHeader";

export const AppMobileHeaderLoader = async () => {
  const usage = await getUsageSummary();

  return <AppMobileHeader initialUsage={usage} />;
};

export const AppMobileHeaderFallback = () => {
  return (
    <header
      className="app-mobile-header-pad sticky top-0 z-40 border-b border-border bg-background lg:hidden"
      aria-busy="true"
      aria-label="Loading account menu"
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />
        <div className="size-10 animate-pulse rounded-xl bg-muted" />
      </div>
    </header>
  );
};
