import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatArticleDate,
  getArticles,
} from "@/lib/queries/articles";

export const metadata: Metadata = {
  title: "Блог",
  description: "Статьи и материалы специалистов центра РАДЕНИЕ",
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div className="bg-background px-4 py-16 md:px-6">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold text-foreground">Блог</h1>
          <p className="max-w-2xl text-muted-foreground">
            Статьи о психологии, отношениях, телесной терапии и личностном росте
            от специалистов центра РАДЕНИЕ.
          </p>
        </div>

        {articles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Статей пока нет. Загляните позже или{" "}
              <Link href="/specialists" className="text-brand hover:underline">
                познакомьтесь со специалистами
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
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
                    {article.videoPodcastUrl && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-brand">
                          <Mic className="h-3.5 w-3.5" />
                          Подкаст
                        </span>
                      </>
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="hover:text-brand"
                    >
                      {article.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="leading-relaxed text-muted-foreground">
                    {article.excerpt}
                  </p>
                  <Button variant="ghost" asChild className="px-0">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-2"
                    >
                      Читать далее
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
