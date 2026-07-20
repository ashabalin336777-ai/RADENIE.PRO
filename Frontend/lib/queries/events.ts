import { prisma } from "@/lib/prisma";
import { eventsPreview } from "@/lib/data/events-preview";

export type EventItem = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string | null;
  link: string | null;
};

export async function getEvents(): Promise<EventItem[]> {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
    });

    if (events.length > 0) {
      return events;
    }
  } catch {
    // DB unavailable — fallback below
  }

  return eventsPreview.map((event) => ({
    ...event,
    date: new Date(event.date),
  }));
}

export function formatEventDate(date: Date): string {
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
