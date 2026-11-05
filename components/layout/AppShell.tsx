import { type ReactNode, Suspense } from "react";

import {
  AppMobileHeaderFallback,
  AppMobileHeaderLoader,
} from "./AppMobileHeaderLoader";
import { AppMobileNav } from "./AppMobileNav";
import { AppMobileNavFallback } from "./AppMobileNavFallback";
import { AppSidebar } from "./AppSidebar";
import { AppSidebarFallback } from "./AppSidebarFallback";

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Suspense fallback={<AppSidebarFallback />}>
        <AppSidebar />
      </Suspense>
      <Suspense fallback={<AppMobileHeaderFallback />}>
        <AppMobileHeaderLoader />
      </Suspense>
      <div className="app-shell-main-pad flex min-h-0 min-w-0 flex-1 flex-col lg:pb-0">
        {children}
      </div>
      <Suspense fallback={<AppMobileNavFallback />}>
        <AppMobileNav />
      </Suspense>
    </div>
  );
};
