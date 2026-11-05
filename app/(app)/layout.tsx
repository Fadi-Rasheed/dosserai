import { type ReactNode } from "react";

import { AppShell } from "@/components/layout";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return <AppShell>{children}</AppShell>;
};

export default AppLayout;
