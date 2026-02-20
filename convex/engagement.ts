import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleLike = mutation({
  args: {
    articleSlug: v.string(),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_visitor_article", (q) =>
        q.eq("visitorId", args.visitorId).eq("articleSlug", args.articleSlug)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }

    await ctx.db.insert("likes", {
      articleSlug: args.articleSlug,
      visitorId: args.visitorId,
    });
    return true;
  },
});

export const getLikeCount = query({
  args: { articleSlug: v.string() },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_article", (q) => q.eq("articleSlug", args.articleSlug))
      .collect();
    return likes.length;
  },
});

export const hasLiked = query({
  args: {
    articleSlug: v.string(),
    visitorId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.visitorId) return false;
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_visitor_article", (q) =>
        q.eq("visitorId", args.visitorId).eq("articleSlug", args.articleSlug)
      )
      .unique();
    return !!existing;
  },
});
