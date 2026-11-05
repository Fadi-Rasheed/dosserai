import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";
import classNames from "classnames";

import { Logo } from "@/components/shared/Logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatusPageAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type StatusPageProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction: StatusPageAction;
  secondaryAction?: StatusPageAction;
  className?: string;
  header?: ReactNode;
};

export const StatusPage = ({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  header,
}: StatusPageProps) => {
  return (
    <div
      className={classNames(
        "flex min-h-full flex-1 flex-col bg-background",
        className,
      )}
    >
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center px-6 sm:px-10">
          {header ?? <Logo />}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <Card className="shadow-lift">
          <CardHeader className="items-center gap-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {title}
              </CardTitle>
              <CardDescription className="text-base leading-6">
                {description}
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 pt-2">
              {primaryAction.href ? (
                <Link
                  href={primaryAction.href}
                  className={classNames(
                    buttonVariants({ size: "lg" }),
                    "h-12 w-full rounded-full font-semibold",
                  )}
                >
                  {primaryAction.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className={classNames(
                    buttonVariants({ size: "lg" }),
                    "h-12 w-full rounded-full font-semibold",
                  )}
                >
                  {primaryAction.label}
                </button>
              )}
              {secondaryAction ? (
                secondaryAction.href ? (
                  <Link
                    href={secondaryAction.href}
                    className={classNames(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 w-full rounded-full font-semibold",
                    )}
                  >
                    {secondaryAction.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={secondaryAction.onClick}
                    className={classNames(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 w-full rounded-full font-semibold",
                    )}
                  >
                    {secondaryAction.label}
                  </button>
                )
              ) : null}
            </div>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
};
