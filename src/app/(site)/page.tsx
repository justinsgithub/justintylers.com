import Link from "next/link";
import { ArrowRight, Code, Bot, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArticleCard } from "@/components/articles/article-card";
import { SocialLinks } from "@/components/social-links";
import { getAllArticles } from "@/lib/mdx";

const projects = [
  {
    icon: Bot,
    title: "Tyler",
    description:
      "My personal AI assistant. Built on Claude Code with file-based memory, automatic context injection, and a Telegram interface.",
    href: "/articles/meet-tyler",
  },
  {
    icon: Database,
    title: "Contractors",
    description:
      "Lead generation platform for contractor sales teams. Custom scraping, data enrichment, and CRM dashboard.",
    href: "/projects",
  },
  {
    icon: Code,
    title: "Spa Science Lab",
    description:
      "Educational platform with 500+ content items covering spa and wellness science.",
    href: "/projects",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-24 sm:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Justin Angeles.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
             I&apos;m passionate about health &amp; wellness. I love people, about as extroverted as you can get. I spend most my time helping people improve their health and wellness with spa services. I also enjoy helping companies automate and improve their business processes using AI and building custom software.
          </p>
          <SocialLinks className="mt-6" />
          <div className="mt-8 flex gap-4">
            <Link href="/articles">
              <Button size="lg">
                Read my articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">
                More about me
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What I'm Working On */}
      <section className="pb-24">
        <h2 className="text-2xl font-bold tracking-tight">
          What I&apos;m Working On
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.title} href={project.href}>
              <Card className="h-full border-border/50 bg-card/50 transition-colors hover:border-primary/20">
                <CardContent className="pt-6">
                  <project.icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-semibold">{project.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      <section className="pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Latest Articles
          </h2>
          <Link
            href="/articles"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ArrowRight className="ml-1 inline h-3 w-3" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4">
          {getAllArticles()
            .slice(0, 3)
            .map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="pb-24">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight">
            Stay in the loop
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            I write about health, software, AI, and what I&apos;m learning along
            the way. No spam.
          </p>
          <div className="mx-auto mt-6 flex max-w-sm gap-3">
            <Link href="/newsletter" className="w-full">
              <Button className="w-full">Subscribe to newsletter</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
