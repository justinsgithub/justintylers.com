import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { ArticlesList } from "@/components/articles/articles-list";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Exploring tech & AI, business, philosophy, and health & wellbeing.",
};

export default async function ArticlesPage() {
  const articles = await fetchQuery(api.articles.list, {});

  const mapped = articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    category: a.category,
    readingTime: a.readingTime || "",
    publishedAt: a.publishedAt,
    image: a.image || undefined,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Articles
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Exploring tech &amp; AI, business, philosophy, and health &amp;
        wellbeing.
      </p>
      <div className="mt-10">
        <ArticlesList articles={mapped} />
      </div>
    </div>
  );
}
