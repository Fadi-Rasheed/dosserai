"use client";

import classNames from "classnames";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const SignOutButton = () => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={classNames(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-11 w-full rounded-xl font-semibold text-muted-foreground",
      )}
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
};
