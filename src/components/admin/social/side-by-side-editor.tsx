"use client";

import { Textarea } from "@/components/ui/textarea";
import { CharCounter } from "./char-counter";
import { PlatformBadge } from "./platform-badge";
import { PLATFORMS, type Platform } from "@/lib/social-constants";

interface PlatformContent {
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
}

export function SideBySideEditor({
  content,
  onChange,
}: {
  content: PlatformContent;
  onChange: (platform: Platform, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {PLATFORMS.map((p) => (
        <div
          key={p.key}
          className="flex flex-col gap-2 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between">
            <PlatformBadge platform={p.key} showLabel size="md" />
            <CharCounter
              current={content[p.key].length}
              limit={p.limit}
            />
          </div>
          <Textarea
            value={content[p.key]}
            onChange={(e) => onChange(p.key, e.target.value)}
            placeholder={`Write your ${p.label} post...`}
            className="min-h-[160px] resize-y text-sm"
          />
        </div>
      ))}
    </div>
  );
}
