import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("subscribers", {
      email: args.email,
      source: args.source,
      subscribedAt: Date.now(),
    });
  },
});

export const isSubscribed = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return !!sub;
  },
});
