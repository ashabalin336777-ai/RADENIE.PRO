import Link from "next/link";
import { notFound } from "next/navigation";
import { Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatArticleDate,
  getArticleBySlug,
} from "@/lib/queries/articles";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Статья не найдена" };

  return {
    title: article.title,
    description: article.excerpt,
  };
}

function renderContent(content: string) {
  return content.split("\n\n").map((block, index) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-8 text-xl font-semibold">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.startsWith("---")) {
      return <hr key={index} className="my-8 border-border" />;
    }
    if (block.startsWith("*") && block.endsWith("*")) {
      return (
        <p key={index} className="italic text-muted-foreground">
          {block.replace(/^\*|\*$/g, "")}
        </p>
      );
    }
    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").filter(Boolean);
      return (
        <ol key={index} className="list-decimal space-y-2 pl-5">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed text-muted-foreground">
              {item.replace(/^\d+\.\s\*\*|\*\*/g, "").replace(/\*\*/g, "")}
            </li>
          ))}
        </ol>
      );
    }
    return (
      <p key={index} className="leading-relaxed text-muted-foreground">
        {block.replace(/\*\*(.*?)\*\*/g, "$1")}
      </p>
    );
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <article className="bg-background px-4 py-16 md:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={article.createdAt.toISOString()}>
              {formatArticleDate(article.createdAt)}
            </time>
            <span>·</span>
            {article.authorSlug ? (
              <Link
                href={`/specialists/${article.authorSlug}`}
                className="text-brand hover:underline"
              >
                {article.authorName}
              </Link>
            ) : (
              <span>{article.authorName}</span>
            )}
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-foreground">
            {article.title}
          </h1>
        </header>

        {article.videoPodcastUrl && (
          <section className="space-y-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
              <Mic className="h-5 w-5 text-brand" />
              Видео-подкаст
            </h2>
            <div className="aspect-video overflow-hidden rounded-2xl bg-brand/10">
              <iframe
                src={article.videoPodcastUrl}
                title={article.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        <div className="space-y-4">{renderContent(article.content)}</div>

        <div className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
          {article.authorSlug && (
            <Button variant="outline" asChild>
              <Link href={`/specialists/${article.authorSlug}`}>
                Профиль автора
              </Link>
            </Button>
          )}
          <Button variant="accent" asChild>
            <Link
              href={
                article.authorSlug
                  ? `/specialists/${article.authorSlug}#booking`
                  : "/specialists"
              }
            >
              Записаться
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/blog">Все статьи</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
