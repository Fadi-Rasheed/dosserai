import type { Metadata } from "next";

import { DashboardPage } from "./DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
};

type DashboardProps = {
  searchParams: Promise<{ page?: string }>;
};

const Dashboard = ({ searchParams }: DashboardProps) => {
  return <DashboardPage searchParams={searchParams} />;
};

export default Dashboard;
