import { cn } from "@/lib/utils";
import { STATUS_STYLES, type Status } from "@/lib/social-constants";

export function StatusBadge({ status }: { status: Status }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        style.color,
        style.bg
      )}
    >
      {style.label}
    </span>
  );
}
