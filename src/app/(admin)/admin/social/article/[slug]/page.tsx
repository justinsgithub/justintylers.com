"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { DraftCard } from "@/components/admin/social/draft-card";
import { type Platform, type Status } from "@/lib/social-constants";
import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";

export default function ArticleDraftsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const drafts = useQuery(api.socialDrafts.getDraftsByArticle, {
    articleSlug: slug,
  });

  const title = drafts?.[0]?.articleTitle ?? slug;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/social"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Drafts for: {title}
          </h1>
          <a
            href={`https://justintylers.com/articles/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View article
          </a>
        </div>
        <Link
          href={`/admin/social/new?article=${slug}`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PenSquare className="h-4 w-4" />
          New Draft for Article
        </Link>
      </div>

      {drafts === undefined ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No social drafts linked to this article yet.
        </p>
      ) : (
        <div className="space-y-2">
          {drafts.map((draft) => (
            <DraftCard
              key={draft._id}
              id={draft._id}
              title={draft.title}
              platform={draft.platform as Platform}
              content={draft.content}
              status={draft.status as Status}
              characterCount={draft.characterCount}
              articleSlug={draft.articleSlug}
              articleTitle={draft.articleTitle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
