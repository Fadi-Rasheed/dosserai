import type { UsageSummary } from "@/lib/types";

type UsageMeterProps = {
  usage: UsageSummary;
};

export const UsageMeter = ({ usage }: UsageMeterProps) => {
  const progress = Math.min(
    100,
    Math.round((usage.queriesToday / usage.dailyLimit) * 100),
  );

  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Daily queries</p>
        <p className="text-sm text-muted-foreground">
          {usage.queriesToday} / {usage.dailyLimit}
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={usage.queriesToday}
        aria-valuemin={0}
        aria-valuemax={usage.dailyLimit}
        aria-label="Queries used today"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
