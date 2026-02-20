import { Metadata } from "next";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Get my sometimes good, sometimes ridiculous ideas straight to your inbox.",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Newsletter
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Get my sometimes good, sometimes ridiculous ideas straight to your
        inbox.
      </p>

      <div className="mt-10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What to expect</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Whatever I&apos;m building or experimenting with
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Stuff I found interesting that week
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              The occasional hot take on AI, health, or life in general
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
