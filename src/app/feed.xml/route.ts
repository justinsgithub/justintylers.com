import { getAllArticles } from "@/lib/mdx";

export async function GET() {
  const articles = getAllArticles();
  const baseUrl = "https://justintylers.com";

  const items = articles
    .map(
      (article) => `
    <item>
      <title><![CDATA[${article.frontmatter.title}]]></title>
      <link>${baseUrl}/articles/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/articles/${article.slug}</guid>
      <description><![CDATA[${article.frontmatter.description}]]></description>
      <pubDate>${new Date(article.frontmatter.publishedAt).toUTCString()}</pubDate>
      <category>${article.frontmatter.category}</category>
    </item>`
    )
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Justin Tyler</title>
    <link>${baseUrl}</link>
    <description>Health and wellness, software development, and AI integration. Articles on building, learning, and growing.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
