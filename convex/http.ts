import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Tyler-Key",
};

async function validateTylerApiKey(
  request: Request
): Promise<{ valid: boolean; error?: string }> {
  const apiKey = request.headers.get("X-Tyler-Key");
  const expectedKey = process.env.TYLER_API_KEY;

  if (!expectedKey) {
    return { valid: false, error: "Tyler integration not configured" };
  }

  if (apiKey !== expectedKey) {
    return { valid: false, error: "Invalid API key" };
  }

  return { valid: true };
}

const http = httpRouter();

// ============================================================
// TYLER - SOCIAL DRAFTS
// ============================================================

http.route({
  path: "/tyler/social-drafts",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/tyler/social-drafts",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const validation = await validateTylerApiKey(request);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userEmail = process.env.MY_EMAIL || "justinaawd@gmail.com";

    let user = await ctx.runQuery(internal.users.getUserByEmail, {
      email: userEmail,
    });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    let body: {
      drafts: Array<{
        groupId: string;
        sortOrder: number;
        title: string;
        platform: "linkedin" | "twitter" | "instagram" | "facebook";
        content: string;
        hashtags?: string[];
        articleSlug?: string;
        articleUrl?: string;
        articleTitle?: string;
        status?:
          | "draft"
          | "review"
          | "approved"
          | "scheduled"
          | "published"
          | "archived";
        photoNeeded?: string;
        notes?: string;
        source?: string;
      }>;
    };

    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!body.drafts || !Array.isArray(body.drafts)) {
      return new Response(JSON.stringify({ error: "drafts array required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const created = [];
    for (const draft of body.drafts) {
      const id = await ctx.runMutation(
        internal.socialDrafts.createDraftFromTyler,
        {
          userId: user._id,
          groupId: draft.groupId,
          sortOrder: draft.sortOrder ?? 0,
          title: draft.title,
          platform: draft.platform,
          content: draft.content,
          hashtags: draft.hashtags,
          articleSlug: draft.articleSlug,
          articleUrl: draft.articleUrl,
          articleTitle: draft.articleTitle,
          status: draft.status,
          photoNeeded: draft.photoNeeded,
          notes: draft.notes,
          source: draft.source,
        }
      );
      created.push(id);
    }

    return new Response(
      JSON.stringify({ success: true, created: created.length, ids: created }),
      { status: 200, headers: corsHeaders }
    );
  }),
});

http.route({
  path: "/tyler/social-drafts",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const validation = await validateTylerApiKey(request);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userEmail = process.env.MY_EMAIL || "justinaawd@gmail.com";

    let user = await ctx.runQuery(internal.users.getUserByEmail, {
      email: userEmail,
    });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const validStatuses = [
      "draft",
      "review",
      "approved",
      "scheduled",
      "published",
      "archived",
    ] as const;
    const status =
      statusParam &&
      validStatuses.includes(statusParam as (typeof validStatuses)[number])
        ? (statusParam as (typeof validStatuses)[number])
        : undefined;

    const drafts = await ctx.runQuery(
      internal.socialDrafts.getDraftsByStatus,
      {
        userId: user._id,
        status,
      }
    );

    return new Response(JSON.stringify({ success: true, data: drafts }), {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/tyler/social-drafts",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const validation = await validateTylerApiKey(request);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const body = await request.json();
    const updates = body.updates;
    if (!Array.isArray(updates) || updates.length === 0) {
      return new Response(
        JSON.stringify({ error: "updates array required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    let updated = 0;
    for (const update of updates) {
      const { id, ...fields } = update;
      if (!id) continue;
      await ctx.runMutation(internal.socialDrafts.updateDraftFromTyler, {
        id: id as Id<"socialDrafts">,
        ...fields,
      });
      updated++;
    }

    return new Response(JSON.stringify({ success: true, updated }), {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

// ============================================================
// TYLER - ARTICLES SYNC
// ============================================================

http.route({
  path: "/tyler/sync-articles",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/tyler/sync-articles",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const validation = await validateTylerApiKey(request);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    let body: {
      articles: Array<{
        slug: string;
        title: string;
        description: string;
        category: string;
        tags: string[];
        publishedAt: string;
        featured: boolean;
        draft: boolean;
        image?: string;
        readingTime?: string;
      }>;
    };

    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!body.articles || !Array.isArray(body.articles)) {
      return new Response(
        JSON.stringify({ error: "articles array required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    let synced = 0;
    for (const article of body.articles) {
      await ctx.runMutation(internal.articles.syncArticle, article);
      synced++;
    }

    return new Response(
      JSON.stringify({ success: true, synced }),
      { status: 200, headers: corsHeaders }
    );
  }),
});

// ============================================================
// TYLER - STATUS
// ============================================================

http.route({
  path: "/tyler/status",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", service: "justintylers.com" }),
      { status: 200, headers: corsHeaders }
    );
  }),
});

export default http;
