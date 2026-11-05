import { Logo, UsageMeterSection } from "@/components/shared";
import { AppSidebarNav } from "./AppSidebarNav";
import { SignOutButton } from "./SignOutButton";
import { getUsageSummary } from "@/lib/data/usage";

export const AppSidebar = async () => {
  const usage = await getUsageSummary();

  return (
    <aside className="hidden w-full flex-col border-b border-border bg-background lg:flex lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="flex h-20 items-center border-b border-border px-6">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-5">
        <AppSidebarNav />

        <div className="mt-auto space-y-4">
          <UsageMeterSection initialUsage={usage} />
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
};
