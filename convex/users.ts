import { mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      if (
        existingUser.email !== identity.email ||
        existingUser.name !== identity.name
      ) {
        await ctx.db.patch(existingUser._id, {
          email: identity.email!,
          name: identity.name,
          imageUrl: identity.pictureUrl,
          updatedAt: Date.now(),
        });
      }
      return existingUser._id;
    }

    // Fallback: check by email (handles Clerk instance migration)
    if (identity.email) {
      const userByEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .unique();

      if (userByEmail) {
        await ctx.db.patch(userByEmail._id, {
          clerkId: identity.subject,
          name: identity.name,
          imageUrl: identity.pictureUrl,
          updatedAt: Date.now(),
        });
        return userByEmail._id;
      }
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email!,
      name: identity.name,
      imageUrl: identity.pictureUrl,
      updatedAt: Date.now(),
    });
  },
});


export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    if (results.length === 0) return null;
    if (results.length === 1) return results[0];

    // Multiple users with same email - return most recently updated
    return results.reduce((latest, current) =>
      current.updatedAt > latest.updatedAt ? current : latest
    );
  },
});
