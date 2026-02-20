import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SocialLinks } from "@/components/social-links";

const footerLinks = [
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/newsletter", label: "Newsletter" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="space-y-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Justin Tyler
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Health and wellness, software development, and AI integration.
            </p>
            <SocialLinks />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Pages</p>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Justin Tyler Angeles. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
