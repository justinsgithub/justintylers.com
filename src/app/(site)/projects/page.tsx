import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, Microscope, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects and portfolio: contractor lead generation, Spa Science Lab, Tyler AI assistant, and more.",
};

const projects = [
  {
    slug: "contractors",
    title: "Contractor Lead Generation",
    description:
      "Built a lead generation platform for contractor sales teams. Custom scraping from state licensing boards, phone number enrichment, and a CRM dashboard for managing outreach.",
    icon: Database,
  },
  {
    slug: "spa-science-lab",
    title: "Spa Science Lab",
    description:
      "Educational platform teaching spa and wellness science through interactive articles, ingredient databases, glossary, and structured learning paths.",
    icon: Microscope,
  },
  {
    slug: "tyler",
    title: "Tyler: Personal AI Assistant",
    description:
      "A persistent AI assistant built on Claude Code with file-based memory, automatic context injection, Telegram interface, and integrations across finances, health, and productivity.",
    icon: Bot,
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
        {projects.map((project) => (
          <Card
            key={project.slug}
            className="border-border/50 bg-card/30 transition-all hover:border-primary/20 hover:bg-card/60"
          >
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <project.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold tracking-tight">
                    {project.title}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
