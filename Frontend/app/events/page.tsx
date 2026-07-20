import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventDate, getEvents } from "@/lib/queries/events";

export const metadata: Metadata = {
  title: "Мероприятия",
  description: "Анонсы лекций, практикумов и открытых встреч центра РАДЕНИЕ",
};

export default async function EventsPage() {
  const events = await getEvents();
  const now = new Date();

  const upcoming = events.filter((event) => event.date >= now);
  const past = events.filter((event) => event.date < now);

  return (
    <div className="bg-background px-4 py-16 md:px-6">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold text-foreground">Мероприятия</h1>
          <p className="max-w-2xl text-muted-foreground">
            Лекции, практикумы и открытые встречи центра РАДЕНИЕ. Приходите очно
            или подключайтесь онлайн.
          </p>
        </div>

        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Ближайших мероприятий пока нет. Следите за обновлениями или{" "}
              <Link href="/specialists" className="text-brand hover:underline">
                запишитесь на консультацию
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Ближайшие</h2>
            <div className="space-y-6">
              {upcoming.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-brand">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatEventDate(event.date)}
                      </span>
                      {event.location && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.link ? (
                      <Button variant="accent" asChild>
                        <a href={event.link} target="_blank" rel="noreferrer">
                          Подробнее / регистрация
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" asChild>
                        <Link href="/specialists">Записаться на консультацию</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-muted-foreground">Прошедшие</h2>
            <div className="space-y-4">
              {past.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-border bg-white/60 p-6"
                >
                  <p className="font-medium">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatEventDate(event.date)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
