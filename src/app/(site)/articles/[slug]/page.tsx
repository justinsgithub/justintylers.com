import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { getArticleBySlug, getAllSlugs } from "@/lib/mdx";
import { mdxComponents } from "@/components/articles/mdx-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const categoryLabels: Record<string, string> = {
  tech: "Tech & AI",
  business: "Business",
  philosophy: "Philosophy",
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description,
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      type: "article",
      publishedTime: article.frontmatter.publishedAt,
      authors: ["Justin Tyler Angeles"],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const { frontmatter, content, readingTime } = article;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/articles"
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-3 w-3" />
        Back to articles
      </Link>

      <article className="mt-8">
        <header>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">
              {categoryLabels[frontmatter.category] || frontmatter.category}
            </Badge>
            <span>{readingTime}</span>
            <time>
              {new Date(frontmatter.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {frontmatter.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {frontmatter.description}
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

      {/* Newsletter CTA */}
      <div className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h3 className="text-xl font-bold">Enjoyed this article?</h3>
        <p className="mt-2 text-muted-foreground">
          Get more like it delivered to your inbox.
        </p>
        <Link href="/newsletter" className="mt-4 inline-block">
          <Button>Subscribe to newsletter</Button>
        </Link>
      </div>
    </div>
  );
}
