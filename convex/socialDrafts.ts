import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/auth";

const platformValidator = v.union(
  v.literal("linkedin"),
  v.literal("twitter"),
  v.literal("instagram"),
  v.literal("facebook")
);

const statusValidator = v.union(
  v.literal("draft"),
  v.literal("review"),
  v.literal("approved"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("archived")
);

// ============================================================
// PUBLIC QUERIES
// ============================================================

export const listDrafts = query({
  args: {
    status: v.optional(statusValidator),
    platform: v.optional(platformValidator),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    let q;
    if (args.status) {
      q = ctx.db
        .query("socialDrafts")
        .withIndex("by_userId_status", (idx) =>
          idx.eq("userId", user._id).eq("status", args.status!)
        );
    } else if (args.platform) {
      q = ctx.db
        .query("socialDrafts")
        .withIndex("by_userId_platform", (idx) =>
          idx.eq("userId", user._id).eq("platform", args.platform!)
        );
    } else {
      q = ctx.db
        .query("socialDrafts")
        .withIndex("by_userId", (idx) => idx.eq("userId", user._id));
    }

    return await q.order("desc").collect();
  },
});

export const getDraft = query({
  args: { id: v.id("socialDrafts") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== user._id) return null;
    return draft;
  },
});

export const getDraftGroup = query({
  args: { groupId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db
      .query("socialDrafts")
      .withIndex("by_groupId", (idx) => idx.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

export const getQueue = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const drafts = await ctx.db
      .query("socialDrafts")
      .withIndex("by_userId_sortOrder", (idx) => idx.eq("userId", user._id))
      .collect();

    return drafts.filter(
      (d) => d.status !== "archived" && d.status !== "published"
    );
  },
});

export const getStatusCounts = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const all = await ctx.db
      .query("socialDrafts")
      .withIndex("by_userId", (idx) => idx.eq("userId", user._id))
      .collect();

    const counts: Record<string, number> = {
      draft: 0,
      review: 0,
      approved: 0,
      scheduled: 0,
      published: 0,
      archived: 0,
    };
    for (const d of all) {
      counts[d.status] = (counts[d.status] ?? 0) + 1;
    }

    const groups = new Set(all.map((d) => d.groupId));
    return { counts, totalDrafts: all.length, totalPosts: groups.size };
  },
});

export const getDraftsByArticle = query({
  args: { articleSlug: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db
      .query("socialDrafts")
      .withIndex("by_userId_articleSlug", (idx) =>
        idx.eq("userId", user._id).eq("articleSlug", args.articleSlug)
      )
      .collect();
  },
});

export const getGroupSummaries = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const all = await ctx.db
      .query("socialDrafts")
      .withIndex("by_userId_sortOrder", (idx) => idx.eq("userId", user._id))
      .collect();

    const groupMap = new Map<
      string,
      {
        groupId: string;
        title: string;
        platforms: string[];
        status: string;
        articleSlug?: string;
        articleTitle?: string;
        sortOrder: number;
        updatedAt: number;
        drafts: typeof all;
      }
    >();

    for (const d of all) {
      const existing = groupMap.get(d.groupId);
      if (existing) {
        existing.platforms.push(d.platform);
        existing.drafts.push(d);
        if (d.updatedAt > existing.updatedAt) {
          existing.updatedAt = d.updatedAt;
        }
      } else {
        groupMap.set(d.groupId, {
          groupId: d.groupId,
          title: d.title,
          platforms: [d.platform],
          status: d.status,
          articleSlug: d.articleSlug,
          articleTitle: d.articleTitle,
          sortOrder: d.sortOrder,
          updatedAt: d.updatedAt,
          drafts: [d],
        });
      }
    }

    return Array.from(groupMap.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
  },
});

// ============================================================
// PUBLIC MUTATIONS
// ============================================================

export const createDraft = mutation({
  args: {
    groupId: v.string(),
    sortOrder: v.number(),
    title: v.string(),
    platform: platformValidator,
    content: v.string(),
    hashtags: v.optional(v.array(v.string())),
    articleSlug: v.optional(v.string()),
    articleUrl: v.optional(v.string()),
    articleTitle: v.optional(v.string()),
    status: v.optional(statusValidator),
    photoNeeded: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("socialDrafts", {
      userId: user._id,
      groupId: args.groupId,
      sortOrder: args.sortOrder,
      title: args.title,
      platform: args.platform,
      content: args.content,
      hashtags: args.hashtags,
      articleSlug: args.articleSlug,
      articleUrl: args.articleUrl,
      articleTitle: args.articleTitle,
      status: args.status ?? "draft",
      characterCount: args.content.length,
      photoNeeded: args.photoNeeded,
      notes: args.notes,
      createdBy: "justin",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDraft = mutation({
  args: {
    id: v.id("socialDrafts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    articleSlug: v.optional(v.string()),
    articleUrl: v.optional(v.string()),
    articleTitle: v.optional(v.string()),
    photoNeeded: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== user._id) {
      throw new Error("Draft not found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) {
      updates.content = args.content;
      updates.characterCount = args.content.length;
    }
    if (args.hashtags !== undefined) updates.hashtags = args.hashtags;
    if (args.articleSlug !== undefined) updates.articleSlug = args.articleSlug;
    if (args.articleUrl !== undefined) updates.articleUrl = args.articleUrl;
    if (args.articleTitle !== undefined)
      updates.articleTitle = args.articleTitle;
    if (args.photoNeeded !== undefined) updates.photoNeeded = args.photoNeeded;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.id, updates);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("socialDrafts"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== user._id) {
      throw new Error("Draft not found");
    }

    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "published") {
      updates.publishedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const updateGroupStatus = mutation({
  args: {
    groupId: v.string(),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const drafts = await ctx.db
      .query("socialDrafts")
      .withIndex("by_groupId", (idx) => idx.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    const now = Date.now();
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };
    if (args.status === "published") {
      updates.publishedAt = now;
    }

    for (const draft of drafts) {
      await ctx.db.patch(draft._id, updates);
    }
  },
});

export const scheduleDraft = mutation({
  args: {
    id: v.id("socialDrafts"),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== user._id) {
      throw new Error("Draft not found");
    }

    const scheduledFor = new Date(
      `${args.scheduledDate}T${args.scheduledTime}:00`
    ).getTime();

    await ctx.db.patch(args.id, {
      status: "scheduled",
      scheduledFor,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      updatedAt: Date.now(),
    });
  },
});

export const deleteDraft = mutation({
  args: { id: v.id("socialDrafts") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== user._id) {
      throw new Error("Draft not found");
    }
    await ctx.db.delete(args.id);
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const drafts = await ctx.db
      .query("socialDrafts")
      .withIndex("by_groupId", (idx) => idx.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const draft of drafts) {
      await ctx.db.delete(draft._id);
    }
  },
});

export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("socialDrafts")),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    for (const id of args.ids) {
      const draft = await ctx.db.get(id);
      if (draft && draft.userId === user._id) {
        const updates: Record<string, unknown> = {
          status: args.status,
          updatedAt: now,
        };
        if (args.status === "published") {
          updates.publishedAt = now;
        }
        await ctx.db.patch(id, updates);
      }
    }
  },
});

export const reorderDrafts = mutation({
  args: {
    updates: v.array(
      v.object({ id: v.id("socialDrafts"), sortOrder: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    for (const update of args.updates) {
      const draft = await ctx.db.get(update.id);
      if (draft && draft.userId === user._id) {
        await ctx.db.patch(update.id, { sortOrder: update.sortOrder });
      }
    }
  },
});

export const attachMedia = mutation({
  args: {
    id: v.id("socialDrafts"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== user._id) {
      throw new Error("Draft not found");
    }

    const siblings = await ctx.db
      .query("socialDrafts")
      .withIndex("by_groupId", (idx) => idx.eq("groupId", draft.groupId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    const now = Date.now();
    for (const sibling of siblings) {
      const mediaIds = sibling.mediaIds ?? [];
      if (!mediaIds.includes(args.storageId)) {
        mediaIds.push(args.storageId);
        await ctx.db.patch(sibling._id, { mediaIds, updatedAt: now });
      }
    }
  },
});

export const removeMedia = mutation({
  args: {
    id: v.id("socialDrafts"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const draft = await ctx.db.get(args.id);
    if (!draft || draft.userId !== user._id) {
      throw new Error("Draft not found");
    }

    const siblings = await ctx.db
      .query("socialDrafts")
      .withIndex("by_groupId", (idx) => idx.eq("groupId", draft.groupId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    const now = Date.now();
    for (const sibling of siblings) {
      const mediaIds = (sibling.mediaIds ?? []).filter(
        (id) => id !== args.storageId
      );
      await ctx.db.patch(sibling._id, { mediaIds, updatedAt: now });
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireCurrentUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getMediaUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    await requireCurrentUser(ctx);
    const urls: Record<string, string | null> = {};
    for (const id of args.storageIds) {
      urls[id] = await ctx.storage.getUrl(id);
    }
    return urls;
  },
});

export const deleteMedia = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireCurrentUser(ctx);
    await ctx.storage.delete(args.storageId);
  },
});

// ============================================================
// INTERNAL (Tyler HTTP endpoints)
// ============================================================

export const createDraftFromTyler = internalMutation({
  args: {
    userId: v.id("users"),
    groupId: v.string(),
    sortOrder: v.number(),
    title: v.string(),
    platform: platformValidator,
    content: v.string(),
    hashtags: v.optional(v.array(v.string())),
    articleSlug: v.optional(v.string()),
    articleUrl: v.optional(v.string()),
    articleTitle: v.optional(v.string()),
    status: v.optional(statusValidator),
    photoNeeded: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("socialDrafts", {
      userId: args.userId,
      groupId: args.groupId,
      sortOrder: args.sortOrder,
      title: args.title,
      platform: args.platform,
      content: args.content,
      hashtags: args.hashtags,
      articleSlug: args.articleSlug,
      articleUrl: args.articleUrl,
      articleTitle: args.articleTitle,
      status: args.status ?? "review",
      characterCount: args.content.length,
      photoNeeded: args.photoNeeded,
      notes: args.notes,
      source: args.source ?? "tyler_import",
      createdBy: "tyler",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDraftFromTyler = internalMutation({
  args: {
    id: v.id("socialDrafts"),
    status: v.optional(statusValidator),
    content: v.optional(v.string()),
    title: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    articleSlug: v.optional(v.string()),
    articleUrl: v.optional(v.string()),
    articleTitle: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    if (filtered.content) {
      (filtered as Record<string, unknown>).characterCount = (
        filtered.content as string
      ).length;
    }
    (filtered as Record<string, unknown>).updatedAt = Date.now();
    await ctx.db.patch(id, filtered);
  },
});

export const deleteDraftsFromTyler = internalMutation({
  args: {
    ids: v.array(v.id("socialDrafts")),
  },
  handler: async (ctx, args) => {
    let deleted = 0;
    for (const id of args.ids) {
      const draft = await ctx.db.get(id);
      if (draft) {
        await ctx.db.delete(id);
        deleted++;
      }
    }
    return deleted;
  },
});

export const getPendingReview = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("socialDrafts")
      .withIndex("by_userId_status", (idx) =>
        idx.eq("userId", args.userId).eq("status", "review")
      )
      .collect();
  },
});

export const getDraftsByStatus = internalQuery({
  args: {
    userId: v.id("users"),
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("socialDrafts")
        .withIndex("by_userId_status", (idx) =>
          idx.eq("userId", args.userId).eq("status", args.status!)
        )
        .collect();
    }
    return await ctx.db
      .query("socialDrafts")
      .withIndex("by_userId", (idx) => idx.eq("userId", args.userId))
      .collect();
  },
});

export const getScheduledDrafts = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("socialDrafts")
      .withIndex("by_userId_status", (idx) =>
        idx.eq("userId", args.userId).eq("status", "scheduled")
      )
      .collect();
  },
});
