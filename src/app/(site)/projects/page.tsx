import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Database, Microscope, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects and portfolio: contractor lead generation, Spa Science Lab, Tyler AI assistant, and more.",
};

const projects = [
  {
    slug: "contractors",
    title: "Proprietary Lead Generation Platform",
    description:
      "Built a proprietary lead generation platform that has scraped and enriched over 1.5 million contractor leads. Automated research and scraping from various sources and databases on the web, phone number enrichment, quality filtering, and a client dashboard for data export and invoice creation.",
    icon: Database,
  },
  {
    slug: "spa-science-lab",
    title: "Spa Science Lab",
    description: "Educational platform teaching spa and wellness science through interactive articles, ingredient databases, glossary, and structured learning paths.",
    icon: Microscope,
    href: "https://spasciencelab.com",
    external: true,
  },
  {
    slug: "tyler",
    title: "Tyler: Personal AI Assistant",
    description:
      "A persistent AI assistant built on Claude Code with file-based memory, automatic context injection, Telegram interface, and integrations across finances, health, and productivity.",
    icon: Bot,
    href: "/articles/meet-tyler",
  },
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Projects
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Real projects with real results. Here&apos;s what I&apos;ve built.
      </p>

      <div className="mt-10 grid gap-6">
        {projects.map((project) => {
          const content = (
            <Card
              className={`border-border/50 bg-card/30 transition-all hover:border-primary/20 hover:bg-card/60 ${project.href ? "cursor-pointer" : ""}`}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <project.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight">
                      {project.title}
                      {project.href && (
                        <ExternalLink className="ml-2 inline h-4 w-4 text-muted-foreground" />
                      )}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          if (project.href && project.external) {
            return (
              <a key={project.slug} href={project.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
          }

          if (project.href) {
            return (
              <Link key={project.slug} href={project.href}>
                {content}
              </Link>
            );
          }

          return <div key={project.slug}>{content}</div>;
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Want something built for your business?
        </p>
        <Link href="/contact" className="mt-4 inline-block">
          <button className="inline-flex items-center text-primary hover:underline underline-offset-2">
            Let&apos;s talk
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
