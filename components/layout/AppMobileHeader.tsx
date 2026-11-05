"use client";

import classNames from "classnames";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Logo, UsageMeterSection } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import type { UsageSummary } from "@/lib/types";

import { SignOutButton } from "./SignOutButton";

type AppMobileHeaderProps = {
  initialUsage: UsageSummary;
};

export const AppMobileHeader = ({ initialUsage }: AppMobileHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  return (
    <header className="app-mobile-header-pad sticky top-0 z-40 border-b border-border bg-background lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Logo />

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={classNames(
              buttonVariants({ variant: "outline", size: "icon" }),
              "size-10 rounded-xl",
            )}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute top-full right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-background p-4 shadow-lift"
            >
              <UsageMeterSection initialUsage={initialUsage} />
              <div className="mt-4">
                <SignOutButton />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
