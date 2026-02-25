import { getAllArticles } from "@/lib/mdx";
import { NextResponse } from "next/server";

export async function GET() {
  const articles = getAllArticles();
  return NextResponse.json(
    articles.map((a) => ({
      slug: a.slug,
      title: a.frontmatter.title,
    }))
  );
}
