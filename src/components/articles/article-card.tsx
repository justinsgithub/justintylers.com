import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { ArticleListItem } from "./articles-list";

const categoryLabels: Record<string, string> = {
  tech: "Tech & AI",
  business: "Business",
  philosophy: "Philosophy",
  health: "Health & Wellbeing",
};

export function ArticleCard({ article }: { article: ArticleListItem }) {
  const { slug, title, description, category, readingTime, publishedAt, image } = article;

  return (
    <Link
      href={`/articles/${slug}`}
      className="group block overflow-hidden rounded-lg border border-border/50 bg-card/30 transition-all hover:border-primary/20 hover:bg-card/60"
    >
      {image && (
        <div className="aspect-[2.4/1] overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={600}
            height={250}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="p-6">
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
      </div>
    </Link>
  );
}
