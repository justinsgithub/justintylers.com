"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PenSquare, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  tech: "Tech & AI",
  business: "Business",
  philosophy: "Philosophy",
  health: "Health & Wellbeing",
};

type ArticleStatus = "draft" | "review" | "published";
type Filter = "all" | "published" | "drafts" | "review";

function getStatus(article: { draft: boolean; status?: string }): ArticleStatus {
  if (article.status === "review") return "review";
  return article.draft ? "draft" : "published";
}

const statusBadge: Record<ArticleStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "" },
  review: { label: "Review", className: "bg-blue-600/20 text-blue-400" },
  published: { label: "Published", className: "bg-green-600/20 text-green-400" },
};

export default function AdminArticlesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedIds, setSelectedIds] = useState<Id<"articles">[]>([]);
  const articles = useQuery(api.articles.list, { includeDrafts: true });
  const bulkSetStatus = useMutation(api.articles.bulkSetStatus);

  const filtered = articles?.filter((a) => {
    const s = getStatus(a);
    if (filter === "published") return s === "published";
    if (filter === "drafts") return s === "draft";
    if (filter === "review") return s === "review";
    return true;
  });

  const publishedCount = articles?.filter((a) => getStatus(a) === "published").length ?? 0;
  const draftCount = articles?.filter((a) => getStatus(a) === "draft").length ?? 0;
  const reviewCount = articles?.filter((a) => getStatus(a) === "review").length ?? 0;

  const toggleSelect = (id: Id<"articles">, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleBulkAction = async (status: ArticleStatus) => {
    const label = status === "review" ? "Moved to review" : status === "draft" ? "Moved to drafts" : "Published";
    await bulkSetStatus({ ids: selectedIds, status });
    toast.success(`${label}: ${selectedIds.length} article${selectedIds.length > 1 ? "s" : ""}`);
    setSelectedIds([]);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Articles</h1>
        <Link href="/admin/articles/new">
          <Button size="sm" className="md:h-9 md:px-4">
            <PenSquare className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Article</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{articles?.length ?? 0}</strong>{" "}
          total
        </span>
        <span>
          <strong className="text-foreground">{publishedCount}</strong> published
        </span>
        <span>
          <strong className="text-foreground">{reviewCount}</strong> review
        </span>
        <span>
          <strong className="text-foreground">{draftCount}</strong> drafts
        </span>
      </div>

      <div className="flex gap-2">
        {(["all", "published", "review", "drafts"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={cn("h-8 capitalize", filter === f && "pointer-events-none")}
          >
            {f}
          </Button>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("review")}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Review
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("draft")}>
              Draft
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("published")}>
              Publish
            </Button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {filtered === undefined ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No articles found.
          </p>
        ) : (
          filtered.map((article) => {
            const s = getStatus(article);
            const badge = statusBadge[s];
            const isSelected = selectedIds.includes(article._id);
            return (
              <div
                key={article._id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 sm:p-4",
                  isSelected && "border-primary/40 bg-primary/5"
                )}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => toggleSelect(article._id, checked === true)}
                  />
                </div>
                <Link
                  href={`/admin/articles/${article._id}`}
                  className="flex flex-1 flex-col gap-2 min-w-0 sm:flex-row sm:items-center sm:gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="truncate text-sm font-medium text-foreground">
                        {article.title}
                      </span>
                      <Badge
                        variant={s === "draft" ? "secondary" : "default"}
                        className={cn("text-xs shrink-0", badge.className)}
                      >
                        {badge.label}
                      </Badge>
                      {article.featured && (
                        <Badge className="bg-yellow-600/20 text-yellow-400 text-xs shrink-0">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {article.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 sm:gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[article.category] || article.category}
                    </Badge>
                    {article.readingTime && <span>{article.readingTime}</span>}
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
