import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { includeDrafts: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("articles").collect();
    const filtered = args.includeDrafts
      ? all
      : all.filter((a) => !a.draft);
    return filtered.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const syncArticle = internalMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    publishedAt: v.string(),
    featured: v.boolean(),
    draft: v.boolean(),
    image: v.optional(v.string()),
    readingTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("articles", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
