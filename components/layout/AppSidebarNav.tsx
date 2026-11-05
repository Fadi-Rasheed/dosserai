"use client";

import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";

import { appNavItems } from "./appNavItems";

export const AppSidebarNav = () => {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {appNavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={classNames(
              buttonVariants({
                variant: isActive ? "secondary" : "ghost",
                size: "lg",
              }),
              "h-11 w-full justify-start gap-3 rounded-xl px-4 font-semibold",
              isActive && "shadow-sm",
            )}
          >
            <item.icon className="size-5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
