"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes";
import { api } from "../../../../../../convex/_generated/api";
import type { Value } from "platejs";
import { createSlateEditor } from "platejs";
import { MarkdownPlugin } from "@platejs/markdown";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { ArticleEditor } from "@/components/admin/articles/article-editor";
import { CoverImageUpload } from "@/components/admin/articles/cover-image-upload";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewArticlePage() {
  const router = useRouter();
  const createArticle = useMutation(api.articles.create);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tech");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState<string | undefined>();
  const [editorValue, setEditorValue] = useState<Value | undefined>();
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(
    () => !!(title || description || editorValue),
    [title, description, editorValue]
  );
  useUnsavedChanges(isDirty);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleEditorChange = useCallback((value: Value) => {
    setEditorValue(value);
  }, []);

  const handleSave = async (asDraft: boolean) => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setSaving(true);
    try {
      // Serialize editor content to JSON string and markdown
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

      const id = await createArticle({
        slug: slug.trim(),
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        publishedAt: new Date().toISOString().split("T")[0],
        featured,
        draft: asDraft,
        image: image || undefined,
        content: contentJson,
        contentMarkdown,
      });

      toast.success(asDraft ? "Draft saved" : "Article published");
      router.push(`/admin/articles/${id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create article"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/admin/articles"
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground sm:text-2xl">New Article</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:h-9 md:px-4"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? "Saving..." : "Draft"}
          </Button>
          <Button
            size="sm"
            className="md:h-9 md:px-4"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? "Publishing..." : "Publish"}
          </Button>
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
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Slug
            </label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              placeholder="article-slug"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for SEO and previews"
              className="min-h-[80px]"
            />
          </div>

          <CoverImageUpload image={image} onChange={setImage} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
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
              onChange={(e) => setTags(e.target.value)}
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
              onCheckedChange={(checked) => setFeatured(checked === true)}
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-foreground"
            >
              Featured article
            </label>
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Content
          </label>
          <ArticleEditor onChange={handleEditorChange} />
        </div>
      </div>
    </div>
  );
}
