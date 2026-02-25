import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const REPO_ROOT = process.cwd();
const ARTICLES_DIR = path.join(REPO_ROOT, "content/articles");
const DRAFTS_DIR = path.join(REPO_ROOT, "content/drafts");

const isProd = process.argv.includes("--prod");
const CONVEX_SITE_URL = isProd
  ? "https://earnest-woodpecker-507.convex.site"
  : "https://jovial-dragon-87.convex.site";

const TYLER_API_KEY = process.env.TYLER_API_KEY;
if (!TYLER_API_KEY) {
  console.error("TYLER_API_KEY not set. Run: source ~/.claude/.env");
  process.exit(1);
}

function readMdxFiles(dir: string, forceDraft: boolean) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const source = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(source);
      const stats = readingTime(content);
      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        category: data.category ?? "uncategorized",
        tags: data.tags ?? [],
        publishedAt: data.publishedAt ?? new Date().toISOString().split("T")[0],
        featured: data.featured ?? false,
        draft: forceDraft ? true : (data.draft ?? false),
        image: data.image,
        readingTime: stats.text,
      };
    });
}

const articles = [
  ...readMdxFiles(ARTICLES_DIR, false),
  ...readMdxFiles(DRAFTS_DIR, true),
];

console.log(
  `Syncing ${articles.length} articles to ${isProd ? "PROD" : "DEV"}...`
);

const res = await fetch(`${CONVEX_SITE_URL}/tyler/sync-articles`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Tyler-Key": TYLER_API_KEY,
  },
  body: JSON.stringify({ articles }),
});

const result = await res.json();
if (result.success) {
  console.log(`Synced ${result.synced} articles.`);
} else {
  console.error("Sync failed:", result);
  process.exit(1);
}
