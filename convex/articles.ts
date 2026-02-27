import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
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

export const getById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAllSlugs = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    return articles.filter((a) => !a.draft).map((a) => a.slug);
  },
});

export const create = mutation({
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
    content: v.optional(v.string()),
    contentMarkdown: v.optional(v.string()),
    contentHtml: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error(`Article with slug "${args.slug}" already exists`);
    }

    const now = Date.now();
    return await ctx.db.insert("articles", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    publishedAt: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    draft: v.optional(v.boolean()),
    image: v.optional(v.string()),
    readingTime: v.optional(v.string()),
    content: v.optional(v.string()),
    contentMarkdown: v.optional(v.string()),
    contentHtml: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Article not found");

    // If slug is changing, check uniqueness
    if (fields.slug && fields.slug !== existing.slug) {
      const slugTaken = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", fields.slug!))
        .unique();
      if (slugTaken) {
        throw new Error(`Slug "${fields.slug}" is already taken`);
      }
    }

    // Filter out undefined values
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const publish = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new Error("Article not found");

    await ctx.db.patch(args.id, {
      draft: false,
      publishedAt: article.publishedAt || new Date().toISOString().split("T")[0],
      updatedAt: Date.now(),
    });
  },
});

export const unpublish = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      draft: true,
      updatedAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Internal query for Tyler HTTP API
export const listInternal = internalQuery({
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

// Internal mutation for Tyler HTTP API updates
export const updateFromTyler = internalMutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    publishedAt: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    draft: v.optional(v.boolean()),
    content: v.optional(v.string()),
    contentMarkdown: v.optional(v.string()),
    contentHtml: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

// Internal mutation for Tyler API and migration
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
    content: v.optional(v.string()),
    contentMarkdown: v.optional(v.string()),
    contentHtml: v.optional(v.string()),
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
