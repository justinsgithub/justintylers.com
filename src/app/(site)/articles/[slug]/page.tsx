import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import Image from "next/image";
import { mdxComponents } from "@/components/articles/mdx-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  tech: "Tech & AI",
  business: "Business",
  philosophy: "Philosophy",
};

export async function generateStaticParams() {
  const slugs = await fetchQuery(api.articles.getAllSlugs, {});
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchQuery(api.articles.getBySlug, { slug });
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      authors: ["Justin Angeles"],
      ...(article.image ? { images: [{ url: article.image }] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchQuery(api.articles.getBySlug, { slug });
  if (!article || article.draft) notFound();

  const content = article.contentMarkdown || "";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/articles"
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-3 w-3" />
        Back to articles
      </Link>

      {article.image && (
        <div className="mt-8 overflow-hidden rounded-xl">
          <Image
            src={article.image}
            alt={article.title}
            width={1536}
            height={864}
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full object-cover"
            priority
          />
        </div>
      )}

      <article className={article.image ? "mt-6" : "mt-8"}>
        <header>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">
              {categoryLabels[article.category] || article.category}
            </Badge>
            {article.readingTime && <span>{article.readingTime}</span>}
            <time>
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {article.description}
          </p>
        </header>

        <div className="prose mt-10">
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                rehypePlugins: [rehypeSlug],
              },
            }}
          />
        </div>
      </article>

      {/* Subscribe CTA */}
      <div className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h3 className="text-xl font-bold">Want to stay in the loop?</h3>
        <p className="mt-2 text-muted-foreground">
          Get notified when I publish new articles or launch new projects.
        </p>
        <Link href="/subscribe" className="mt-4 inline-block">
          <Button>Subscribe for updates</Button>
        </Link>
      </div>
    </div>
  );
}
