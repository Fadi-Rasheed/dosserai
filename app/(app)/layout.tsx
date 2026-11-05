import { type ReactNode } from "react";

import { AppShell } from "@/components/layout";

export const dynamic = "force-dynamic";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return <AppShell>{children}</AppShell>;
};

export default AppLayout;
