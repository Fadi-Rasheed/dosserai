import classNames from "classnames";
import { Search } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/supabase/server";

type LandingAskCtaLinkProps = {
  href: string;
};

const LandingAskCtaLink = ({ href }: LandingAskCtaLinkProps) => {
  return (
    <Link
      href={href}
      className="mt-10 flex w-full max-w-2xl items-center gap-3 rounded-full border border-border bg-card p-2 pl-6 text-left shadow-search transition-shadow hover:shadow-lift"
    >
      <Search
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate text-base text-foreground sm:text-lg">
        What are the payment terms in my freelance contract?
      </span>
      <span
        className={classNames(
          buttonVariants({ size: "lg" }),
          "shrink-0 rounded-full px-5 font-semibold",
        )}
      >
        Ask
      </span>
    </Link>
  );
};

export const LandingAskCtaFallback = () => {
  return <LandingAskCtaLink href="/login" />;
};

export const LandingAskCtaAuth = async () => {
  const user = await getOptionalUser();

  return <LandingAskCtaLink href={user ? "/chat" : "/login"} />;
};
