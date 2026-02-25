"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { StatusBadge } from "./status-badge";
import { PlatformBadge } from "./platform-badge";
import { CharCounter } from "./char-counter";
import { PLATFORM_MAP, type Platform, type Status } from "@/lib/social-constants";
import { Check, Archive, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface DraftCardProps {
  id: Id<"socialDrafts">;
  title: string;
  platform: Platform;
  content: string;
  status: Status;
  characterCount?: number;
  articleSlug?: string;
  articleTitle?: string;
  selected?: boolean;
  onSelect?: (id: Id<"socialDrafts">, checked: boolean) => void;
}

export function DraftCard({
  id,
  title,
  platform,
  content,
  status,
  characterCount,
  articleSlug,
  articleTitle,
  selected,
  onSelect,
}: DraftCardProps) {
  const updateStatus = useMutation(api.socialDrafts.updateStatus);
  const deleteDraft = useMutation(api.socialDrafts.deleteDraft);
  const platformInfo = PLATFORM_MAP[platform];
  const charCount = characterCount ?? content.length;

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    await updateStatus({ id, status: "approved" });
    toast.success("Draft approved");
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    await updateStatus({ id, status: "archived" });
    toast.success("Draft archived");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteDraft({ id });
    toast.success("Draft deleted");
  };

  return (
    <Link
      href={`/admin/social/${id}`}
      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-card/80"
    >
      {onSelect && (
        <div
          className="pt-0.5"
          onClick={(e) => e.preventDefault()}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(id, checked as boolean)}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <PlatformBadge platform={platform} />
          <StatusBadge status={status} />
          {articleSlug && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              {articleTitle || articleSlug}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {content}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <CharCounter current={charCount} limit={platformInfo.limit} />
        </div>
      </div>

      <div
        className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.preventDefault()}
      >
        {status !== "approved" && status !== "published" && (
          <button
            onClick={handleApprove}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-green-900/30 hover:text-green-400"
            title="Approve"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={handleArchive}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-yellow-900/30 hover:text-yellow-400"
          title="Archive"
        >
          <Archive className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-red-900/30 hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}
