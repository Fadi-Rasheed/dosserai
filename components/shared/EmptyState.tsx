import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import classNames from "classnames";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <Card
      className={classNames(
        "mx-auto w-full max-w-lg border-dashed shadow-none",
        className,
      )}
    >
      <CardHeader className="items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-base leading-6">
            {description}
          </CardDescription>
        </div>
        {action ? <div className="pt-2">{action}</div> : null}
      </CardHeader>
    </Card>
  );
};
