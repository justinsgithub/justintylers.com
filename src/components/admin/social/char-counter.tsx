import { cn } from "@/lib/utils";

export function CharCounter({
  current,
  limit,
}: {
  current: number;
  limit: number;
}) {
  const percentage = (current / limit) * 100;
  const isOver = current > limit;
  const isNear = percentage > 90 && !isOver;

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        isOver
          ? "text-red-400 font-medium"
          : isNear
            ? "text-yellow-400"
            : "text-muted-foreground"
      )}
    >
      {current.toLocaleString()}/{limit.toLocaleString()}
    </span>
  );
}
