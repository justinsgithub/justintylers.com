import { Metadata } from "next";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Weekly insights on AI, automation, and building software for real businesses.",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Newsletter
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Weekly insights on AI, automation, and building software for real
        businesses.
      </p>

      <div className="mt-10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What you&apos;ll get</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              What I built or shipped that week
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              One interesting AI/tech link with my take
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              A deep dive article from the site
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              No spam. Unsubscribe anytime.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/30 p-6">
          <NewsletterSignup source="newsletter-page" />
        </div>
      </div>
    </div>
  );
}
