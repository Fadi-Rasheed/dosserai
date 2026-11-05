"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSafeRedirectPath } from "@/lib/auth/safeRedirect";
import { queryKeys } from "@/lib/queries/keys";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const LoginForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const nextPath = getSafeRedirectPath(searchParams.get("next"));

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.usage.all }),
    ]);

    router.push(nextPath);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="h-12 rounded-xl px-4"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-12 rounded-xl px-4"
        />
      </div>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="mt-1 h-12 w-full rounded-full font-semibold"
      >
        {isSubmitting ? "Signing in..." : "Continue"}
      </Button>
    </form>
  );
};
