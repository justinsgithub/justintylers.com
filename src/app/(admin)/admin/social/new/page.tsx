"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { SideBySideEditor } from "@/components/admin/social/side-by-side-editor";
import { ArticleSlugPicker } from "@/components/admin/social/article-slug-picker";
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
import { type Platform, type Status } from "@/lib/social-constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const createDraft = useMutation(api.socialDrafts.createDraft);

  const [title, setTitle] = useState("");
  const [articleSlug, setArticleSlug] = useState<string | undefined>();
  const [articleTitle, setArticleTitle] = useState<string | undefined>();
  const [photoNeeded, setPhotoNeeded] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("draft");
  const [saving, setSaving] = useState(false);

  const articlesData = useQuery(api.articles.list, { includeDrafts: true });
  const articles = useMemo(
    () => (articlesData ?? []).map((a) => ({ slug: a.slug, title: a.title })),
    [articlesData]
  );

  const [content, setContent] = useState({
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
  });

  const handleContentChange = (platform: Platform, value: string) => {
    setContent((prev) => ({ ...prev, [platform]: value }));
  };

  const handleArticleChange = (slug?: string, title?: string) => {
    setArticleSlug(slug);
    setArticleTitle(title);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const platforms = (
      Object.entries(content) as [Platform, string][]
    ).filter(([_, text]) => text.trim().length > 0);

    if (platforms.length === 0) {
      toast.error("Write content for at least one platform");
      return;
    }

    setSaving(true);
    try {
      const groupId = crypto.randomUUID();
      const articleUrl = articleSlug
        ? `https://justintylers.com/articles/${articleSlug}`
        : undefined;

      for (let i = 0; i < platforms.length; i++) {
        const [platform, text] = platforms[i];
        await createDraft({
          groupId,
          sortOrder: 0,
          title,
          platform,
          content: text,
          articleSlug,
          articleUrl,
          articleTitle,
          status,
          photoNeeded: photoNeeded || undefined,
          notes: notes || undefined,
        });
      }

      toast.success(`Created ${platforms.length} drafts`);
      router.push("/admin/social");
    } catch (err) {
      toast.error("Failed to create drafts");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">New Post</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Create Post"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Internal post title"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Article
            </label>
            <ArticleSlugPicker
              articles={articles}
              value={articleSlug}
              onChange={handleArticleChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as Status)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Photo needed
            </label>
            <Input
              value={photoNeeded}
              onChange={(e) => setPhotoNeeded(e.target.value)}
              placeholder="Describe the image needed"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes"
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <SideBySideEditor content={content} onChange={handleContentChange} />
        </div>
      </div>
    </div>
  );
}
