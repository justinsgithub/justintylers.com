import { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch about custom software, AI integration, or lead generation projects.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Get in Touch
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Tell me what you need. You can also reach me on{" "}
        <a
          href="https://www.linkedin.com/in/justintangeles"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          LinkedIn
        </a>{" "}
        or{" "}
        <a
          href="https://www.facebook.com/justintangeles"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          Facebook
        </a>
        .
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>

      <div className="mt-12 space-y-2 text-sm text-muted-foreground">
        <p>
          Or email me directly:{" "}
          <a
            href="mailto:justin@justintylers.com"
            className="text-primary underline underline-offset-2"
          >
            justin@justintylers.com
          </a>
        </p>
      </div>
    </div>
  );
}
