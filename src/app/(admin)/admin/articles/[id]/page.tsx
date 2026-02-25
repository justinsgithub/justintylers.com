"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import type { Value } from "platejs";
import { createSlateEditor } from "platejs";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { ArticleEditor } from "@/components/admin/articles/article-editor";
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
import { toast } from "sonner";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as Id<"articles">;

  const article = useQuery(api.articles.getById, { id: articleId });
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
  const [editorValue, setEditorValue] = useState<Value | undefined>();
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (article && !loaded) {
      setTitle(article.title);
      setSlug(article.slug);
      setDescription(article.description);
      setCategory(article.category);
      setTags(article.tags.join(", "));
      setFeatured(article.featured);
      if (article.content) {
        try {
          setEditorValue(JSON.parse(article.content));
        } catch {
          // Content isn't valid JSON, ignore
        }
      }
      setLoaded(true);
    }
  }, [article, loaded]);

  const handleEditorChange = useCallback((value: Value) => {
    setEditorValue(value);
  }, []);

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

    setSaving(true);
    try {
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
        content: contentJson,
        contentMarkdown,
      });
      toast.success("Saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave();
    try {
      await publishArticle({ id: articleId });
      toast.success("Published");
    } catch (err) {
      toast.error("Failed to publish");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishArticle({ id: articleId });
      toast.success("Unpublished");
    } catch (err) {
      toast.error("Failed to unpublish");
    }
  };

  const handleDelete = async () => {
    try {
      await removeArticle({ id: articleId });
      toast.success("Deleted");
      router.push("/admin/articles");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/articles"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground truncate">
          {article.title}
        </h1>
        {article.draft ? (
          <Badge variant="secondary">Draft</Badge>
        ) : (
          <Badge className="bg-green-600/20 text-green-400">Published</Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          {!article.draft && (
            <Link
              href={`/articles/${article.slug}`}
              target="_blank"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Saving..." : "Save"}
          </Button>
          {article.draft ? (
            <Button onClick={handlePublish} size="sm" disabled={saving}>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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
              Slug
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

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
