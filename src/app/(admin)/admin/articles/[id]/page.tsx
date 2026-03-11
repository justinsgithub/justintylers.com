"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import type { Value } from "platejs";
import { createSlateEditor } from "platejs";
import { serializeHtml } from "platejs/static";
import { MarkdownPlugin } from "@platejs/markdown";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { ArticleEditor } from "@/components/admin/articles/article-editor";
import { EditorStatic } from "@/components/ui/editor-static";
import { CoverImageUpload } from "@/components/admin/articles/cover-image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import { toast } from "sonner";
import { ArrowLeft, Trash2, ExternalLink, Loader2, Check, Copy } from "lucide-react";
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

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as Id<"articles">;

  const article = useQuery(api.articles.getById, articleId ? { id: articleId } : "skip");
  const updateArticle = useMutation(api.articles.update);
  const publishArticle = useMutation(api.articles.publish);
  const unpublishArticle = useMutation(api.articles.unpublish);
  const removeArticle = useMutation(api.articles.remove);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tech");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState<string | undefined>();
  const [coverImagePrompt, setCoverImagePrompt] = useState("");
  const [editorValue, setEditorValue] = useState<Value | undefined>();
  const [loaded, setLoaded] = useState(false);
  const hadContentOnLoad = useRef(false);
  const [changeKey, setChangeKey] = useState(0);

  useEffect(() => {
    if (article && !loaded) {
      setTitle(article.title);
      setSlug(article.slug);
      setDescription(article.description);
      setCategory(article.category);
      setTags(article.tags.join(", "));
      setFeatured(article.featured);
      setImage(article.image || undefined);
      setCoverImagePrompt(article.coverImagePrompt ?? "");
      if (article.content) {
        try {
          setEditorValue(JSON.parse(article.content));
        } catch {
          // Content isn't valid JSON, ignore
        }
      } else if (article.contentMarkdown) {
        try {
          const tempEditor = createSlateEditor({
            plugins: BaseEditorKit,
          });
          const value = tempEditor.getApi(MarkdownPlugin).markdown.deserialize(article.contentMarkdown);
          setEditorValue(value);
        } catch {
          // Markdown deserialization failed, ignore
        }
      }
      hadContentOnLoad.current = !!(article.content || article.contentMarkdown);
      setLoaded(true);
    }
  }, [article, loaded]);

  const markDirty = useCallback(() => {
    setChangeKey((k) => k + 1);
  }, []);

  const handleEditorChange = useCallback((value: Value) => {
    setEditorValue(value);
    setChangeKey((k) => k + 1);
  }, []);

  // Wrap field setters to track changes
  const handleTitleChange = useCallback((v: string) => { setTitle(v); markDirty(); }, [markDirty]);
  const handleSlugChange = useCallback((v: string) => { setSlug(v); markDirty(); }, [markDirty]);
  const handleDescriptionChange = useCallback((v: string) => { setDescription(v); markDirty(); }, [markDirty]);
  const handleCategoryChange = useCallback((v: string) => { setCategory(v); markDirty(); }, [markDirty]);
  const handleTagsChange = useCallback((v: string) => { setTags(v); markDirty(); }, [markDirty]);
  const handleFeaturedChange = useCallback((v: boolean) => { setFeatured(v); markDirty(); }, [markDirty]);
  const handleImageChange = useCallback((v: string | undefined) => { setImage(v); markDirty(); }, [markDirty]);
  const handleCoverImagePromptChange = useCallback((v: string) => { setCoverImagePrompt(v); markDirty(); }, [markDirty]);

  // Refs for auto-save to read latest values without re-creating the callback
  const formRef = useRef({ title, slug, description, category, tags, featured, image, coverImagePrompt, editorValue });
  formRef.current = { title, slug, description, category, tags, featured, image, coverImagePrompt, editorValue };

  const doSave = useCallback(async () => {
    const { title, slug, description, category, tags, featured, image, coverImagePrompt, editorValue } = formRef.current;
    if (!title.trim()) return;

    const contentJson = editorValue ? JSON.stringify(editorValue) : undefined;
    let contentMarkdown: string | undefined;

    if (editorValue) {
      try {
        const tempEditor = createSlateEditor({
          plugins: BaseEditorKit,
          value: editorValue,
        });
        contentMarkdown = tempEditor.api.markdown.serialize();
      } catch {
        contentMarkdown = undefined;
      }
    }

    // Guard: don't save empty content if article previously had content
    if (hadContentOnLoad.current && (!contentMarkdown || contentMarkdown.trim().length < 10)) {
      toast.warning("Content appears empty — auto-save skipped. Undo your changes or reload to recover.");
      return;
    }

    await updateArticle({
      id: articleId,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featured,
      image: image || "",
      coverImagePrompt: coverImagePrompt || undefined,
      content: contentJson,
      contentMarkdown,
    });
  }, [articleId, updateArticle]);

  const { status, saveNow } = useAutoSave(changeKey, doSave);
  useUnsavedChanges(status === "unsaved" || status === "saving");

  if (article === undefined) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (article === null) {
    return <div className="text-sm text-red-400">Article not found.</div>;
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    await saveNow();
    toast.success("Saved");
  };

  const handlePublish = async () => {
    await handleSave();
    try {
      await publishArticle({ id: articleId });
      toast.success("Published");
    } catch {
      toast.error("Failed to publish");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishArticle({ id: articleId });
      toast.success("Unpublished");
    } catch {
      toast.error("Failed to unpublish");
    }
  };

  const handleDelete = async () => {
    try {
      await removeArticle({ id: articleId });
      toast.success("Deleted");
      router.push("/admin/articles");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleCopyForLinkedIn = async () => {
    if (!editorValue) return;

    let html = "";
    let plainText = "";
    try {
      const tempEditor = createSlateEditor({
        plugins: BaseEditorKit,
        value: editorValue,
      });
      html = await serializeHtml(tempEditor, {
        editorComponent: EditorStatic,
        props: { style: {} },
      });
      plainText = tempEditor.api.markdown.serialize()
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/\[(.+?)\]\((.+?)\)/g, "$1");
    } catch {
      toast.error("Failed to serialize content");
      return;
    }

    const suffix = `<p><br></p><p>Website <a href="https://justintylers.com">https://justintylers.com</a></p>`;
    const fullHtml = `<h1>${title}</h1>${html}${suffix}`;
    const fullPlain = `${title}\n\n${plainText.trim()}\n\nWebsite https://justintylers.com`;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([fullHtml], { type: "text/html" }),
          "text/plain": new Blob([fullPlain], { type: "text/plain" }),
        }),
      ]);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="min-w-0 truncate text-lg font-bold text-foreground">
            {article.title}
          </h1>
          {article.status === "review" ? (
            <Badge className="bg-blue-600/20 text-blue-400">Review</Badge>
          ) : article.draft ? (
            <Badge variant="secondary">Draft</Badge>
          ) : (
            <Badge className="bg-green-600/20 text-green-400">Published</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SaveIndicator status={status} />
          {!article.draft && (
            <Link
              href={`/articles/${article.slug}`}
              target="_blank"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          <Button onClick={handleCopyForLinkedIn} variant="outline" size="sm">
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button onClick={handleSave} disabled={status === "saving"} size="sm">
            {status === "saving" ? "Saving..." : "Save"}
          </Button>
          {article.draft ? (
            <Button onClick={handlePublish} size="sm" disabled={status === "saving"}>
              Publish
            </Button>
          ) : (
            <Button
              onClick={handleUnpublish}
              variant="outline"
              size="sm"
            >
              Unpublish
            </Button>
          )}
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
                <AlertDialogTitle>Delete this article?</AlertDialogTitle>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Slug
            </label>
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <CoverImageUpload image={image} onChange={handleImageChange} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Cover Image Prompt
            </label>
            <Textarea
              value={coverImagePrompt}
              onChange={(e) => handleCoverImagePromptChange(e.target.value)}
              placeholder="Describe the cover image to generate"
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Category
            </label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Tech & AI</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="philosophy">Philosophy</SelectItem>
                <SelectItem value="health">Health & Wellbeing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="ai, automation, tools"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Comma-separated
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={featured}
              onCheckedChange={(checked) => handleFeaturedChange(checked === true)}
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-foreground"
            >
              Featured article
            </label>
          </div>

          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            <p>
              Published:{" "}
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p>
              Updated:{" "}
              {new Date(article.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Content
          </label>
          {loaded && (
            <ArticleEditor
              initialValue={editorValue}
              onChange={handleEditorChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
