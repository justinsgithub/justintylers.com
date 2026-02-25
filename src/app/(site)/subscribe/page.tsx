import { Metadata } from "next";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const metadata: Metadata = {
  title: "Stay Updated",
  description:
    "Get notified about new articles, projects, and updates from Justin Angeles.",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Stay Updated
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Get notified when I publish new articles or launch new projects.
      </p>

      <div className="mt-10">
        <div className="rounded-xl border border-border/50 bg-card/30 p-6">
          <NewsletterSignup source="newsletter-page" />
        </div>
      </div>
    </div>
  );
}
