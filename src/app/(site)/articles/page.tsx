import { Metadata } from "next";
import { getAllArticles } from "@/lib/mdx";
import { ArticlesList } from "@/components/articles/articles-list";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Writing about whatever I'm into at the moment, including AI, software, and maybe a little philosophy.",
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Articles
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Writing about whatever I&apos;m into at the moment, including AI,
        software, and maybe a little philosophy.
      </p>
      <div className="mt-10">
        <ArticlesList articles={articles} />
      </div>
    </div>
  );
}
