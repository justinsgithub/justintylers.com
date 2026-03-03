"use client";

import { Facebook, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButtons({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Share</span>
      {links.map(({ label, icon: Icon, href }) => (
        <Button
          key={label}
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => window.open(href, "_blank", "width=600,height=400")}
          aria-label={`Share on ${label}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
