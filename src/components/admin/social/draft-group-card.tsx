"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StatusBadge } from "./status-badge";
import { PlatformBadge } from "./platform-badge";
import { type Platform, type Status } from "@/lib/social-constants";
import { Check, Archive, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Doc } from "../../../../convex/_generated/dataModel";

interface GroupSummary {
  groupId: string;
  title: string;
  platforms: string[];
  status: string;
  articleSlug?: string;
  articleTitle?: string;
  sortOrder: number;
  updatedAt: number;
  drafts: Doc<"socialDrafts">[];
}

export function DraftGroupCard({ group }: { group: GroupSummary }) {
  const updateGroupStatus = useMutation(api.socialDrafts.updateGroupStatus);
  const deleteGroup = useMutation(api.socialDrafts.deleteGroup);

  const firstDraft = group.drafts[0];

  const handleApproveGroup = async (e: React.MouseEvent) => {
    e.preventDefault();
    await updateGroupStatus({ groupId: group.groupId, status: "approved" });
    toast.success(`Approved all ${group.platforms.length} variants`);
  };

  const handleArchiveGroup = async (e: React.MouseEvent) => {
    e.preventDefault();
    await updateGroupStatus({ groupId: group.groupId, status: "archived" });
    toast.success(`Archived all ${group.platforms.length} variants`);
  };

  const handleDeleteGroup = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteGroup({ groupId: group.groupId });
    toast.success("Deleted group");
  };

  return (
    <Link
      href={firstDraft ? `/admin/social/${firstDraft._id}` : "#"}
      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-card/80"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {group.platforms.map((p) => (
            <PlatformBadge key={p} platform={p as Platform} />
          ))}
          <StatusBadge status={group.status as Status} />
          <span className="text-xs text-muted-foreground">
            {group.platforms.length} variants
          </span>
          {group.articleSlug && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              {group.articleTitle || group.articleSlug}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-foreground">{group.title}</p>
        {firstDraft && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {firstDraft.content}
          </p>
        )}
      </div>

      <div
        className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.preventDefault()}
      >
        {group.status !== "approved" && group.status !== "published" && (
          <button
            onClick={handleApproveGroup}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-green-900/30 hover:text-green-400"
            title="Approve group"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={handleArchiveGroup}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-yellow-900/30 hover:text-yellow-400"
          title="Archive group"
        >
          <Archive className="h-4 w-4" />
        </button>
        <button
          onClick={handleDeleteGroup}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-red-900/30 hover:text-red-400"
          title="Delete group"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}
