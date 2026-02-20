import { mutation } from "./_generated/server";

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

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email!,
      name: identity.name,
      imageUrl: identity.pictureUrl,
      updatedAt: Date.now(),
    });
  },
});
