import { Suspense } from "react";
import {
  File,
  FileCode2,
  FileSearch,
  FileText,
  FileType,
  Link2,
  ScanText,
  ShieldCheck,
} from "lucide-react";

import { Logo } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  LandingAskCtaAuth,
  LandingAskCtaFallback,
} from "./LandingAskCtaAuth";
import {
  LandingHeaderAuth,
  LandingHeaderAuthFallback,
} from "./LandingHeaderAuth";

const formats = [
  { label: "PDF", icon: FileText },
  { label: "DOCX", icon: File },
  { label: "TXT", icon: FileType },
  { label: "Markdown", icon: FileCode2 },
  { label: "Scans", icon: ScanText },
];

const features = [
  {
    title: "Grounded answers",
    body: "Every reply cites the exact document and passage it came from. Nothing invented.",
    icon: FileSearch,
  },
  {
    title: "Cross-document links",
    body: "Related files are connected on upload, so questions can span your whole archive.",
    icon: Link2,
  },
  {
    title: "Yours alone",
    body: "Original files are never stored. We extract, embed, and discard — your dashboard shows only filename and upload date.",
    icon: ShieldCheck,
  },
];

export const LandingPage = () => {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 sm:px-10">
          <Logo />
          <nav className="flex items-center gap-2">
            <Suspense fallback={<LandingHeaderAuthFallback />}>
              <LandingHeaderAuth />
            </Suspense>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pb-24 pt-16 text-center sm:px-10 sm:pt-24">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl sm:leading-[1.08]">
          Ask your documents anything
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Upload contracts, notes, and scans. We extract the knowledge and
          discard the file — query in plain language with citations.
        </p>

        <Suspense fallback={<LandingAskCtaFallback />}>
          <LandingAskCtaAuth />
        </Suspense>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {formats.map((format) => (
            <li
              key={format.label}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <format.icon className="size-6" aria-hidden="true" />
              <span className="text-xs font-semibold">{format.label}</span>
            </li>
          ))}
        </ul>

        <Card className="mt-16 w-full max-w-2xl p-6 text-left shadow-lift sm:p-8">
          <p className="text-sm font-semibold text-muted-foreground">Answer</p>
          <p className="mt-3 text-lg leading-7 text-foreground">
            Net 30 from invoice date, with a 1.5% monthly late fee after 45
            days.
          </p>
          <Badge
            variant="secondary"
            className="mt-5 h-7 rounded-full px-3 font-medium"
          >
            freelance-agreement.pdf · chunk 4
          </Badge>
        </Card>

        <ul className="mt-16 grid w-full gap-6 text-left sm:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.title}>
              <Card className="h-full transition-shadow hover:shadow-lift">
                <CardHeader className="gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-lg font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-6">
                    {feature.body}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center sm:px-10">
        <p className="text-sm text-muted-foreground">
          PDF · DOCX · TXT · Markdown · Scanned images
        </p>
      </footer>
    </div>
  );
};
