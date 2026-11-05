import classNames from "classnames";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/supabase/server";

const headerAuthLinkClassName = classNames(
  buttonVariants({ size: "lg" }),
  "rounded-full px-5 font-semibold",
);

export const LandingHeaderAuthFallback = () => {
  return (
    <Link href="/login" className={headerAuthLinkClassName}>
      Sign in
    </Link>
  );
};

export const LandingHeaderAuth = async () => {
  const user = await getOptionalUser();

  return (
    <Link
      href={user ? "/dashboard" : "/login"}
      className={headerAuthLinkClassName}
    >
      {user ? "Dashboard" : "Sign in"}
    </Link>
  );
};
