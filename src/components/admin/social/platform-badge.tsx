import { cn } from "@/lib/utils";
import { PLATFORM_MAP, type Platform } from "@/lib/social-constants";
import { Linkedin, Twitter, Instagram, Facebook } from "lucide-react";

const PLATFORM_ICONS: Record<Platform, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
};

export function PlatformBadge({
  platform,
  showLabel = false,
  size = "sm",
}: {
  platform: Platform;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const info = PLATFORM_MAP[platform];
  const Icon = PLATFORM_ICONS[platform];
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium",
        size === "md" && "px-2.5 py-1.5 text-sm"
      )}
      style={{ color: info.color }}
    >
      <Icon className={iconSize} />
      {showLabel && info.label}
    </span>
  );
}
