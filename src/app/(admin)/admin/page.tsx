"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/social/status-badge";
import { PlatformBadge } from "@/components/admin/social/platform-badge";
import { type Status, type Platform } from "@/lib/social-constants";
import { PenSquare, ListTodo } from "lucide-react";

export default function AdminDashboard() {
  const statusCounts = useQuery(api.socialDrafts.getStatusCounts);
  const drafts = useQuery(api.socialDrafts.listDrafts, {});

  const recentDrafts = drafts?.slice(0, 10);

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/social"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ListTodo className="h-4 w-4" />
            Queue
          </Link>
          <Link
            href="/admin/social/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <PenSquare className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      {statusCounts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(
            Object.entries(statusCounts.counts) as [Status, number][]
          ).map(([status, count]) => (
            <Link
              key={status}
              href={`/admin/social?status=${status}`}
              className="rounded-lg border border-border bg-card p-4 text-center transition-colors hover:border-primary/30"
            >
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <StatusBadge status={status} />
            </Link>
          ))}
        </div>
      )}

      {statusCounts && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">
              {statusCounts.totalDrafts}
            </strong>{" "}
            total drafts
          </span>
          <span>
            <strong className="text-foreground">
              {statusCounts.totalPosts}
            </strong>{" "}
            unique posts
          </span>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Recent Drafts
        </h2>
        {recentDrafts && recentDrafts.length > 0 ? (
          <div className="space-y-2">
            {recentDrafts.map((draft) => (
              <Link
                key={draft._id}
                href={`/admin/social/${draft._id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30"
              >
                <PlatformBadge platform={draft.platform as Platform} />
                <span className="flex-1 truncate text-sm text-foreground">
                  {draft.title}
                </span>
                <StatusBadge status={draft.status as Status} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No drafts yet.</p>
        )}
      </div>
    </div>
  );
}
