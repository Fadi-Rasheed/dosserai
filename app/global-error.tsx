"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import "./globals.css";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalErrorPage = ({ error, reset }: GlobalErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/safe-area.css" />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
              <AlertTriangle className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-2 text-base leading-6 text-muted-foreground">
              A critical error occurred. Try again, or reload the app.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={reset}
                className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
              >
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
