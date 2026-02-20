import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    serviceType: v.string(),
    budgetRange: v.optional(v.string()),
    message: v.string(),
    status: v.string(),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  subscribers: defineTable({
    email: v.string(),
    source: v.string(),
    subscribedAt: v.number(),
  }).index("by_email", ["email"]),

  likes: defineTable({
    articleSlug: v.string(),
    visitorId: v.string(),
  })
    .index("by_article", ["articleSlug"])
    .index("by_visitor_article", ["visitorId", "articleSlug"]),
});
