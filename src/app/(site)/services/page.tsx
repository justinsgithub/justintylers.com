import { Metadata } from "next";
import Link from "next/link";
import {
  Code,
  Bot,
  LayoutDashboard,
  ArrowRight,
  MessageSquare,
  Rocket,
  FileSearch,
  Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Custom business software, AI integration, and web applications. Replace spreadsheets, automate tedious work, and get real dashboards.",
};

const services = [
  {
    icon: LayoutDashboard,
    title: "Custom Business Software",
    description:
      "Stop duct-taping spreadsheets together. Get real software built around how your business actually works.",
    features: [
      "Optimize or replace spreadsheets",
      "Data analytics and reporting",
      "Custom dashboards",
      "Automate tedious work",
      "Built for your exact workflow",
    ],
  },
  {
    icon: Bot,
    title: "AI Integration",
    description:
      "Add AI to your existing tools or build something new. Chatbots, workflow automation, intelligent data processing.",
    features: [
      "Custom AI assistants (Claude, GPT)",
      "Workflow automation",
      "Document processing",
      "Email automation",
      "Integration with your existing tools",
    ],
  },
  {
    icon: Code,
    title: "Web Applications",
    description:
      "Full-stack web apps built to your exact specifications. Not templates. Not page builders. Real software that does exactly what you need.",
    features: [
      "Modern React front-end",
      "Real-time database",
      "Authentication and user management",
      "Mobile-responsive design",
      "Deployed and production-ready",
    ],
  },
];

const process = [
  {
    icon: MessageSquare,
    step: "1",
    title: "Discovery",
    description: "We talk about what you need. No sales pitch, just questions.",
  },
  {
    icon: FileSearch,
    step: "2",
    title: "Plan",
    description:
      "I scope the project, define deliverables, and give you a fixed quote.",
  },
  {
    icon: Wrench,
    step: "3",
    title: "Build",
    description:
      "I build it. You get regular updates and a working demo along the way.",
  },
  {
    icon: Rocket,
    step: "4",
    title: "Launch",
    description:
      "Deployed, tested, and live. I stick around to make sure everything works.",
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Services
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Custom software and AI integration for businesses that want to work
        smarter. No agencies, no overhead. Just one developer who ships.
      </p>

      {/* Service Cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.title}
            className="border-border/50 bg-card/30"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold">{service.title}</h2>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {service.description}
              </p>
              <ul className="mt-4 space-y-1.5">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          {process.map((step) => (
            <div key={step.step} className="space-y-2">
              <span className="text-3xl font-bold text-primary/30">
                {step.step}
              </span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight">
          Ready to build something?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Tell me what you need. I&apos;ll tell you what it takes.
        </p>
        <Link href="/contact" className="mt-6 inline-block">
          <Button size="lg">
            Get in touch
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
