import type { Metadata } from "next";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign in",
};

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return children;
};

export default AuthLayout;
