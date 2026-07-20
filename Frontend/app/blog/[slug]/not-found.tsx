import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ArticleNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Статья не найдена</h1>
      <p className="text-muted-foreground">
        Возможно, материал ещё не опубликован или ссылка указана неверно.
      </p>
      <Button variant="outline" asChild>
        <Link href="/blog">К блогу</Link>
      </Button>
    </div>
  );
}
