"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DraftCard } from "@/components/admin/social/draft-card";
import { DraftGroupCard } from "@/components/admin/social/draft-group-card";
import { BulkActionBar } from "@/components/admin/social/bulk-action-bar";
import { FILTER_TABS, type Status, type Platform } from "@/lib/social-constants";
import { cn } from "@/lib/utils";
import { Layers, List, PenSquare } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SocialQueueContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as Status | null;
  const [activeTab, setActiveTab] = useState<string>(initialStatus ?? "all");
  const [groupView, setGroupView] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Id<"socialDrafts">[]>([]);

  const statusArg =
    activeTab === "all"
      ? undefined
      : (activeTab as Status);

  const drafts = useQuery(api.socialDrafts.listDrafts, {
    status: statusArg,
  });
  const groupSummaries = useQuery(api.socialDrafts.getGroupSummaries);

  const filteredGroups =
    activeTab === "all"
      ? groupSummaries?.filter(
          (g) => g.status !== "archived" && g.status !== "published"
        )
      : groupSummaries?.filter((g) => g.status === activeTab);

  const handleSelect = (id: Id<"socialDrafts">, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Social Queue</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGroupView(!groupView)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm transition-colors",
              groupView
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {groupView ? (
              <Layers className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
            {groupView ? "Groups" : "Individual"}
          </button>
          <Link
            href="/admin/social/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <PenSquare className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedIds([]);
            }}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
      />

      {groupView ? (
        <div className="space-y-2">
          {filteredGroups === undefined ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filteredGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No posts in this category.
            </p>
          ) : (
            filteredGroups.map((group) => (
              <DraftGroupCard key={group.groupId} group={group} />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {drafts === undefined ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : drafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No drafts in this category.
            </p>
          ) : (
            drafts.map((draft) => (
              <DraftCard
                key={draft._id}
                id={draft._id}
                title={draft.title}
                platform={draft.platform as Platform}
                content={draft.content}
                status={draft.status as Status}
                characterCount={draft.characterCount}
                articleSlug={draft.articleSlug}
                articleTitle={draft.articleTitle}
                selected={selectedIds.includes(draft._id)}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function SocialQueuePage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <SocialQueueContent />
    </Suspense>
  );
}
