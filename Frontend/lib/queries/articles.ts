import { prisma } from "@/lib/prisma";
import { articlesPreview } from "@/lib/data/articles-preview";

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorSlug: string | null;
  createdAt: Date;
  videoPodcastUrl: string | null;
};

export type ArticleDetail = ArticleListItem & {
  content: string;
};

function excerptFromContent(content: string, max = 160): string {
  const plain = content.replace(/[#*_>\-\n]/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

function previewToList(): ArticleListItem[] {
  return articlesPreview.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    authorName: article.authorName,
    authorSlug: article.authorSlug,
    createdAt: new Date(article.createdAt),
    videoPodcastUrl: article.videoPodcastUrl,
  }));
}

export async function getArticles(): Promise<ArticleListItem[]> {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            name: true,
            specialistProfile: { select: { slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (articles.length > 0) {
      return articles.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: excerptFromContent(article.content),
        authorName: article.author.name,
        authorSlug: article.author.specialistProfile?.slug ?? null,
        createdAt: article.createdAt,
        videoPodcastUrl: article.videoPodcastUrl,
      }));
    }
  } catch {
    // DB unavailable — fallback below
  }

  return previewToList();
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleDetail | null> {
  try {
    const article = await prisma.article.findFirst({
      where: { slug, published: true },
      include: {
        author: {
          select: {
            name: true,
            specialistProfile: { select: { slug: true } },
          },
        },
      },
    });

    if (article) {
      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: excerptFromContent(article.content),
        content: article.content,
        authorName: article.author.name,
        authorSlug: article.author.specialistProfile?.slug ?? null,
        createdAt: article.createdAt,
        videoPodcastUrl: article.videoPodcastUrl,
      };
    }
  } catch {
    // DB unavailable — fallback below
  }

  const preview = articlesPreview.find((item) => item.slug === slug);
  if (!preview) return null;

  return {
    id: preview.id,
    slug: preview.slug,
    title: preview.title,
    excerpt: preview.excerpt,
    content: preview.content,
    authorName: preview.authorName,
    authorSlug: preview.authorSlug,
    createdAt: new Date(preview.createdAt),
    videoPodcastUrl: preview.videoPodcastUrl,
  };
}

export function formatArticleDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
