import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

export interface ArticleFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  category: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
  image?: string;
}

export interface Article {
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: string;
  readingTime: string;
}

export interface ArticleMeta {
  slug: string;
  frontmatter: ArticleFrontmatter;
  readingTime: string;
}

function getMdxFiles(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(source);
  const stats = readingTime(content);

  return {
    slug,
    frontmatter: data as ArticleFrontmatter,
    content,
    readingTime: stats.text,
  };
}

export function getAllArticles(): ArticleMeta[] {
  const files = getMdxFiles();

  const articles = files
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const filePath = path.join(ARTICLES_DIR, file);
      const source = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(source);
      const stats = readingTime(content);

      return {
        slug,
        frontmatter: data as ArticleFrontmatter,
        readingTime: stats.text,
      };
    })
    .filter((a) => !a.frontmatter.draft)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedAt).getTime() -
        new Date(a.frontmatter.publishedAt).getTime()
    );

  return articles;
}

export function getArticlesByCategory(category: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.frontmatter.category === category);
}

export function getFeaturedArticles(): ArticleMeta[] {
  return getAllArticles().filter((a) => a.frontmatter.featured);
}

export function getAllCategories(): string[] {
  const articles = getAllArticles();
  const categories = new Set(articles.map((a) => a.frontmatter.category));
  return Array.from(categories).sort();
}

export function getAllSlugs(): string[] {
  return getMdxFiles().map((f) => f.replace(".mdx", ""));
}
