"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { StatusPage } from "@/components/shared";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const AppErrorPage = ({ error, reset }: AppErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      icon={AlertTriangle}
      title="Something went wrong"
      description="We could not load this page. Try again, or return to your dashboard."
      primaryAction={{ label: "Try again", onClick: reset }}
      secondaryAction={{ label: "Go to dashboard", href: "/dashboard" }}
      className="min-h-0"
    />
  );
};

export default AppErrorPage;
