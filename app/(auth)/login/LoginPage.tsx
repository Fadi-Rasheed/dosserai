import { Suspense } from "react";
import classNames from "classnames";
import Link from "next/link";

import { Logo } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center px-6 sm:px-10">
          <Logo />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <Card className="shadow-lift">
          <CardHeader className="gap-2">
            <CardTitle className="text-3xl font-semibold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-base">
              Log in to your private archive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="mt-8 text-center">
          <Link
            href="/"
            className={classNames(
              buttonVariants({ variant: "link" }),
              "font-semibold text-muted-foreground",
            )}
          >
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
};
