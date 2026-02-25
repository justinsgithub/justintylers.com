"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  tech: "Tech & AI",
  business: "Business",
  philosophy: "Philosophy",
  health: "Health & Wellbeing",
};

type Filter = "all" | "published" | "drafts";

export default function AdminArticlesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const articles = useQuery(api.articles.list, { includeDrafts: true });

  const filtered = articles?.filter((a) => {
    if (filter === "published") return !a.draft;
    if (filter === "drafts") return a.draft;
    return true;
  });

  const publishedCount = articles?.filter((a) => !a.draft).length ?? 0;
  const draftCount = articles?.filter((a) => a.draft).length ?? 0;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Articles</h1>
        <Link href="/admin/articles/new">
          <Button>
            <PenSquare className="mr-2 h-4 w-4" />
            New Article
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
          <strong className="text-foreground">{draftCount}</strong> drafts
        </span>
      </div>

      <div className="flex gap-2">
        {(["all", "published", "drafts"] as Filter[]).map((f) => (
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

      <div className="space-y-2">
        {filtered === undefined ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No articles found.
          </p>
        ) : (
          filtered.map((article) => (
            <Link
              key={article._id}
              href={`/admin/articles/${article._id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {article.title}
                  </span>
                  {article.draft ? (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Draft
                    </Badge>
                  ) : (
                    <Badge className="bg-green-600/20 text-green-400 text-xs shrink-0">
                      Published
                    </Badge>
                  )}
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
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
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
          ))
        )}
      </div>
    </div>
  );
}
