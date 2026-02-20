import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Justin Tyler Angeles: health and wellness, software development, and AI integration. From Alaska to building tools and figuring it out.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        About Me
      </h1>

      <div className="prose mt-10">
        <p className="text-lg leading-8 text-muted-foreground">
          I&apos;m Justin Tyler Angeles. I&apos;m into health and wellness,
          software development, and AI integration.
        </p>

        <h2>The Short Version</h2>
        <p>
          I grew up on the Kenai Peninsula in Alaska, worked multiple jobs
          simultaneously for years, and taught myself to code. Now I build
          software, integrate AI tools, and work in the wellness industry.
        </p>

        <h2>What I Believe</h2>
        <p>
          Life is growth. Everything that moves you forward, even if
          it&apos;s uncomfortable, is worth doing. Everything that keeps you
          stuck is worth questioning.
        </p>
        <p>
          I think AI is one of the most important tools we&apos;ve ever built.
          Not because it replaces people, but because it amplifies what
          people can do. A solo developer with the right AI tools can build
          what used to take a team. That&apos;s not science fiction. That&apos;s
          my Tuesday.
        </p>

        <h2>Tyler</h2>
        <p>
          Tyler is my AI assistant. I named him after my middle name and
          built him on top of Claude Code with a custom memory system, hooks
          that inject context automatically, and a Telegram interface so I
          can reach him from my phone.
        </p>
        <p>
          He tracks my finances, manages my calendar, logs my meals, monitors
          my health data, and helps me build software. He&apos;s not a
          chatbot. He&apos;s a genuine tool that makes my life measurably
          better every day.
        </p>
        <p>
          I write about how I built him and everything he does in my{" "}
          <Link href="/articles" className="text-primary underline underline-offset-2">
            articles
          </Link>
          .
        </p>

        <h2>What I Build</h2>
        <p>
          I built a lead generation platform for contractor sales teams,
          scraping state licensing boards, enriching records with phone numbers,
          and delivering everything through a CRM dashboard.
        </p>
        <p>
          I also built <strong>Spa Science Lab</strong>, an educational
          platform covering spa and wellness science, and{" "}
          <strong>LifeDirector</strong>, a personal tracking system that acts
          as my mission control for goals, health, finances, and relationships.
        </p>

        <h2>Philosophy</h2>
        <blockquote>
          Learn, grow, create, build, teach, connect, live, love.
        </blockquote>
        <p>
          That&apos;s my bio on every platform. It&apos;s also how I try to
          live. I believe in building things that matter, sharing what I
          learn, and helping people do more with less.
        </p>
      </div>

      <div className="mt-12 flex gap-4">
        <Link href="/projects">
          <Button>
            See my work
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline">Get in touch</Button>
        </Link>
      </div>
    </div>
  );
}
