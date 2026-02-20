"use client";

import { useState } from "react";
import { ArticleCard } from "./article-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ArticleMeta } from "@/lib/mdx";

const categories = [
  { value: "all", label: "All" },
  { value: "tech", label: "Tech & AI" },
  { value: "business", label: "Business" },
  { value: "philosophy", label: "Philosophy" },
  { value: "building-in-public", label: "Building in Public" },
];

export function ArticlesList({ articles }: { articles: ArticleMeta[] }) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all"
      ? articles
      : articles.filter((a) => a.frontmatter.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={active === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActive(cat.value)}
            className={cn(
              "h-8",
              active === cat.value && "pointer-events-none"
            )}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-4">
        {filtered.length > 0 ? (
          filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No articles in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
