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

  articles: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    publishedAt: v.string(),
    featured: v.boolean(),
    draft: v.boolean(),
    status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("published"))),
    image: v.optional(v.string()),
    readingTime: v.optional(v.string()),
    content: v.optional(v.string()),
    contentMarkdown: v.optional(v.string()),
    contentHtml: v.optional(v.string()),
    coverImagePrompt: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

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

  socialDrafts: defineTable({
    userId: v.id("users"),
    groupId: v.string(),
    sortOrder: v.number(),

    title: v.string(),
    platform: v.union(
      v.literal("linkedin"),
      v.literal("twitter"),
      v.literal("instagram"),
      v.literal("facebook")
    ),
    content: v.string(),
    hashtags: v.optional(v.array(v.string())),

    mediaIds: v.optional(v.array(v.id("_storage"))),

    articleSlug: v.optional(v.string()),
    articleUrl: v.optional(v.string()),
    articleTitle: v.optional(v.string()),

    status: v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    ),
    scheduledFor: v.optional(v.number()),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.string()),

    publishedAt: v.optional(v.number()),
    publishedPostId: v.optional(v.string()),
    publishedUrl: v.optional(v.string()),

    characterCount: v.optional(v.number()),
    photoNeeded: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_userId_platform", ["userId", "platform"])
    .index("by_userId_scheduledDate", ["userId", "scheduledDate"])
    .index("by_groupId", ["groupId"])
    .index("by_userId_sortOrder", ["userId", "sortOrder"])
    .index("by_userId_articleSlug", ["userId", "articleSlug"]),
});
