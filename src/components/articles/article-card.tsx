import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ArticleMeta } from "@/lib/mdx";

const categoryLabels: Record<string, string> = {
  tech: "Tech & AI",
  business: "Business",
  philosophy: "Philosophy",
  "building-in-public": "Building in Public",
};

export function ArticleCard({ article }: { article: ArticleMeta }) {
  const { slug, frontmatter, readingTime } = article;

  return (
    <Link
      href={`/articles/${slug}`}
      className="group block rounded-lg border border-border/50 bg-card/30 p-6 transition-all hover:border-primary/20 hover:bg-card/60"
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="secondary" className="text-xs">
          {categoryLabels[frontmatter.category] || frontmatter.category}
        </Badge>
        <span>{readingTime}</span>
        <span>
          {new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
        {frontmatter.title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {frontmatter.description}
      </p>
    </Link>
  );
}
