"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArticleOption {
  slug: string;
  title: string;
}

export function ArticleSlugPicker({
  articles,
  value,
  onChange,
}: {
  articles: ArticleOption[];
  value?: string;
  onChange: (slug: string | undefined, title: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? "none"}
      onValueChange={(val) => {
        if (val === "none") {
          onChange(undefined, undefined);
        } else {
          const article = articles.find((a) => a.slug === val);
          onChange(val, article?.title);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Link to article (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No article</SelectItem>
        {articles.map((a) => (
          <SelectItem key={a.slug} value={a.slug}>
            {a.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
