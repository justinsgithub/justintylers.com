import { Metadata } from "next";
import { getAllArticles } from "@/lib/mdx";
import { ArticlesList } from "@/components/articles/articles-list";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Exploring tech & AI, business, philosophy, and health & wellbeing.",
};

export default function ArticlesPage() {
  const articles = getAllArticles();

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
        <ArticlesList articles={articles} />
      </div>
    </div>
  );
}
