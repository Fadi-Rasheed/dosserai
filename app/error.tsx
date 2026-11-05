"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { StatusPage } from "@/components/shared";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      icon={AlertTriangle}
      title="Something went wrong"
      description="An unexpected error occurred. Try again, or return to the home page."
      primaryAction={{ label: "Try again", onClick: reset }}
      secondaryAction={{ label: "Back to home", href: "/" }}
    />
  );
};

export default ErrorPage;
