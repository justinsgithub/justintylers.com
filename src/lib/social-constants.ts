export const PLATFORMS = [
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", limit: 3000 },
  { key: "twitter", label: "X", color: "#000000", limit: 280 },
  { key: "instagram", label: "Instagram", color: "#E4405F", limit: 2200 },
  { key: "facebook", label: "Facebook", color: "#1877F2", limit: 63206 },
] as const;

export type Platform = (typeof PLATFORMS)[number]["key"];

export const PLATFORM_MAP = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p])
) as Record<Platform, (typeof PLATFORMS)[number]>;

export const STATUSES = [
  "draft",
  "review",
  "approved",
  "scheduled",
  "published",
  "archived",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_STYLES: Record<
  Status,
  { label: string; color: string; bg: string }
> = {
  draft: { label: "Draft", color: "text-zinc-400", bg: "bg-zinc-800" },
  review: { label: "Review", color: "text-yellow-400", bg: "bg-yellow-900/30" },
  approved: {
    label: "Approved",
    color: "text-green-400",
    bg: "bg-green-900/30",
  },
  scheduled: {
    label: "Scheduled",
    color: "text-blue-400",
    bg: "bg-blue-900/30",
  },
  published: {
    label: "Published",
    color: "text-purple-400",
    bg: "bg-purple-900/30",
  },
  archived: {
    label: "Archived",
    color: "text-zinc-500",
    bg: "bg-zinc-900/30",
  },
};

export const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "scheduled", label: "Scheduled" },
  { key: "draft", label: "Draft" },
  { key: "published", label: "Published" },
] as const;
