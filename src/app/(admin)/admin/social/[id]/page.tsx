"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { PlatformBadge } from "@/components/admin/social/platform-badge";
import { StatusBadge } from "@/components/admin/social/status-badge";
import { CharCounter } from "@/components/admin/social/char-counter";
import { ArticleSlugPicker } from "@/components/admin/social/article-slug-picker";
import { MediaUpload } from "@/components/admin/social/media-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PLATFORM_MAP,
  STATUSES,
  STATUS_STYLES,
  type Platform,
  type Status,
} from "@/lib/social-constants";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditDraftPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.id as Id<"socialDrafts">;

  const draft = useQuery(api.socialDrafts.getDraft, { id: draftId });
  const group = useQuery(
    api.socialDrafts.getDraftGroup,
    draft ? { groupId: draft.groupId } : "skip"
  );

  const updateDraft = useMutation(api.socialDrafts.updateDraft);
  const updateStatus = useMutation(api.socialDrafts.updateStatus);
  const deleteDraft = useMutation(api.socialDrafts.deleteDraft);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleSlug, setArticleSlug] = useState<string | undefined>();
  const [articleTitle, setArticleTitle] = useState<string | undefined>();
  const [photoNeeded, setPhotoNeeded] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const articlesData = useQuery(api.articles.list, { includeDrafts: true });
  const articles = useMemo(
    () => (articlesData ?? []).map((a) => ({ slug: a.slug, title: a.title })),
    [articlesData]
  );

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setArticleSlug(draft.articleSlug);
      setArticleTitle(draft.articleTitle);
      setPhotoNeeded(draft.photoNeeded ?? "");
      setNotes(draft.notes ?? "");
    }
  }, [draft]);

  if (draft === undefined) {
    return (
      <div className="text-sm text-muted-foreground">Loading draft...</div>
    );
  }

  if (draft === null) {
    return <div className="text-sm text-red-400">Draft not found.</div>;
  }

  const platformInfo = PLATFORM_MAP[draft.platform as Platform];
  const siblings = group?.filter((d) => d._id !== draftId) ?? [];

  const handleSave = async () => {
    setSaving(true);
    try {
      const articleUrl = articleSlug
        ? `https://justintylers.com/articles/${articleSlug}`
        : undefined;

      await updateDraft({
        id: draftId,
        title,
        content,
        articleSlug,
        articleUrl,
        articleTitle,
        photoNeeded: photoNeeded || undefined,
        notes: notes || undefined,
      });
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    await updateStatus({ id: draftId, status: newStatus });
    toast.success(`Status changed to ${STATUS_STYLES[newStatus].label}`);
  };

  const handleDelete = async () => {
    await deleteDraft({ id: draftId });
    toast.success("Deleted");
    router.push("/admin/social");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/social"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PlatformBadge
          platform={draft.platform as Platform}
          showLabel
          size="md"
        />
        <StatusBadge status={draft.status as Status} />
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            size="sm"
            className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {siblings.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Siblings:</span>
          {siblings.map((s) => (
            <Link
              key={s._id}
              href={`/admin/social/${s._id}`}
              className="rounded-md border border-border px-2 py-1 text-xs transition-colors hover:border-primary/30"
            >
              <PlatformBadge platform={s.platform as Platform} />
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Status
            </label>
            <Select
              value={draft.status}
              onValueChange={(val) => handleStatusChange(val as Status)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_STYLES[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Article
            </label>
            <ArticleSlugPicker
              articles={articles}
              value={articleSlug}
              onChange={(slug, title) => {
                setArticleSlug(slug);
                setArticleTitle(title);
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Photo needed
            </label>
            <Input
              value={photoNeeded}
              onChange={(e) => setPhotoNeeded(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Photos
            </label>
            <MediaUpload
              draftId={draftId}
              mediaIds={draft.mediaIds ?? []}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Content
            </label>
            <CharCounter
              current={content.length}
              limit={platformInfo.limit}
            />
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] resize-y text-sm"
          />
        </div>
      </div>
    </div>
  );
}
