"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PLATFORM_MAP,
  STATUSES,
  STATUS_STYLES,
  type Platform,
  type Status,
} from "@/lib/social-constants";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { useAutoSave, type SaveStatus } from "@/lib/hooks/use-auto-save";
import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes";

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving...
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-400">
        <Check className="h-3 w-3" />
        Saved
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs text-yellow-400">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
      Unsaved
    </span>
  );
}

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
  const [changeKey, setChangeKey] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const articlesData = useQuery(api.articles.list, { includeDrafts: true });
  const articles = useMemo(
    () => (articlesData ?? []).map((a) => ({ slug: a.slug, title: a.title })),
    [articlesData]
  );

  useEffect(() => {
    if (draft && !loaded) {
      setTitle(draft.title);
      setContent(draft.content);
      setArticleSlug(draft.articleSlug);
      setArticleTitle(draft.articleTitle);
      setPhotoNeeded(draft.photoNeeded ?? "");
      setNotes(draft.notes ?? "");
      setLoaded(true);
    }
  }, [draft, loaded]);

  const markDirty = useCallback(() => {
    setChangeKey((k) => k + 1);
  }, []);

  const formRef = useRef({ title, content, articleSlug, articleTitle, photoNeeded, notes });
  formRef.current = { title, content, articleSlug, articleTitle, photoNeeded, notes };

  const doSave = useCallback(async () => {
    const { title, content, articleSlug, articleTitle, photoNeeded, notes } = formRef.current;
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
  }, [draftId, updateDraft]);

  const { status, saveNow } = useAutoSave(changeKey, doSave);
  useUnsavedChanges(status === "unsaved" || status === "saving");

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
    await saveNow();
    toast.success("Saved");
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
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/social"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <PlatformBadge
            platform={draft.platform as Platform}
            showLabel
            size="md"
          />
          <StatusBadge status={draft.status as Status} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SaveIndicator status={status} />
          <Button onClick={handleSave} disabled={status === "saving"} size="sm">
            {status === "saving" ? "Saving..." : "Save"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
              onChange={(e) => { setTitle(e.target.value); markDirty(); }}
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
                markDirty();
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Photo needed
            </label>
            <Input
              value={photoNeeded}
              onChange={(e) => { setPhotoNeeded(e.target.value); markDirty(); }}
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
              onChange={(e) => { setNotes(e.target.value); markDirty(); }}
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
            onChange={(e) => { setContent(e.target.value); markDirty(); }}
            className="min-h-[300px] resize-y text-sm"
          />
        </div>
      </div>
    </div>
  );
}
