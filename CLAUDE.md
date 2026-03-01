# justintylers.com

## Deployments

- **Production:** `earnest-woodpecker-507` (use for all real data operations)
- **Dev:** `jovial-dragon-87` (testing only, data may be stale)

## Tyler API (Social Drafts / Articles)

The HTTP API at `https://earnest-woodpecker-507.convex.site/tyler/` works with the `TYLER_API_KEY` from `~/.claude/.env`. Use the **production** site URL, not dev. The dev deployment may not have the env var set.

```bash
# Always use prod for Tyler API calls
curl -s -H "X-Tyler-Key: $TYLER_API_KEY" "https://earnest-woodpecker-507.convex.site/tyler/social-drafts"
```

If the API key fails, use `npx convex export --prod` as a fallback to read data, then use the prod API to write.

## Convex MCP

The MCP `runOneoffQuery` works on the dev deployment selector but prod is read-only (can't read user data or run mutations). For prod mutations, use the Tyler HTTP API.

## Key Paths

- `convex/http.ts` — Tyler API routes (social-drafts, articles)
- `convex/socialDrafts.ts` — Draft mutations including `updateDraftFromTyler`
- `convex/articles.ts` — Article mutations
