"use client";

import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { appNavItems } from "./appNavItems";

export const AppMobileNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="app-mobile-nav-pad fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
        {appNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={classNames(
                "flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
