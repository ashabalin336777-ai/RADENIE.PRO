import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SpecialistCard } from "@/components/specialists/specialist-card";
import { getSpecialists } from "@/lib/queries/specialists";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const specialists = await getSpecialists();

  return (
    <>
      <section className="bg-background px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-brand/10 px-4 py-2 text-sm text-brand">
              <Sparkles className="h-4 w-4" />
              Психологическая поддержка и телесная терапия
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Пространство, где можно быть собой
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                РАДЕНИЕ — центр психологических услуг. Подберём специалиста под
                ваш запрос, поможем записаться на консультацию онлайн или очно.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button variant="accent" size="lg" asChild>
                <Link href="/specialists">Записаться</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/ai-assistant">Подобрать специалиста с AI</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl bg-brand p-8 text-brand-foreground shadow-soft md:p-10">
            <h2 className="text-2xl font-semibold">Как мы работаем</h2>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-brand-foreground/90">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-foreground/15 text-xs font-semibold">
                  1
                </span>
                Расскажите о запросе — самостоятельно или с AI-помощником
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-foreground/15 text-xs font-semibold">
                  2
                </span>
                Выберите специалиста из команды центра
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-foreground/15 text-xs font-semibold">
                  3
                </span>
                Запишитесь на удобное время в календаре
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16 md:px-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-foreground">
                Наши специалисты
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Команда практикующих специалистов с разными подходами — от
                семейной терапии до телесных практик.
              </p>
            </div>
            <Button variant="ghost" asChild className="self-start md:self-auto">
              <Link href="/specialists" className="inline-flex items-center gap-2">
                Все специалисты
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {specialists.slice(0, 5).map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
