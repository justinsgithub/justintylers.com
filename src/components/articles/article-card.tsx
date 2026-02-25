import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ArticleListItem } from "./articles-list";

const categoryLabels: Record<string, string> = {
  tech: "Tech & AI",
  business: "Business",
  philosophy: "Philosophy",
  health: "Health & Wellbeing",
};

export function ArticleCard({ article }: { article: ArticleListItem }) {
  const { slug, title, description, category, readingTime, publishedAt } = article;

  return (
    <Link
      href={`/articles/${slug}`}
      className="group block rounded-lg border border-border/50 bg-card/30 p-6 transition-all hover:border-primary/20 hover:bg-card/60"
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="secondary" className="text-xs">
          {categoryLabels[category] || category}
        </Badge>
        {readingTime && <span>{readingTime}</span>}
        <span>
          {new Date(publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {description}
      </p>
    </Link>
  );
}
