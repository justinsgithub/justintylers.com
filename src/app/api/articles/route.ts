import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { NextResponse } from "next/server";

export async function GET() {
  const articles = await fetchQuery(api.articles.list, { includeDrafts: true });
  return NextResponse.json(
    articles.map((a) => ({
      slug: a.slug,
      title: a.title,
    }))
  );
}
