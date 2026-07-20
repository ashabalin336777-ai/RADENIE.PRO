import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SpecialistNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Специалист не найден</h1>
      <p className="text-muted-foreground">
        Возможно, профиль был удалён или ссылка указана неверно.
      </p>
      <Button variant="outline" asChild>
        <Link href="/specialists">К каталогу</Link>
      </Button>
    </div>
  );
}
