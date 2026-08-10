import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GraduationCap,
  Mail,
  MessageSquare,
  Phone,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingForm } from "@/components/booking/booking-form";
import { getReviewsForSpecialist } from "@/lib/data/reviews";
import {
  getInitials,
  getSpecialistBySlug,
} from "@/lib/queries/specialists";
import { normalizeVideoEmbedUrl } from "@/lib/video-embed";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps) {
  const specialist = await getSpecialistBySlug(params.slug);
  if (!specialist) return { title: "Специалист не найден" };

  return {
    title: specialist.name,
    description: specialist.bio.slice(0, 160),
  };
}

export default async function SpecialistDetailPage({ params }: PageProps) {
  const specialist = await getSpecialistBySlug(params.slug);
  if (!specialist) notFound();

  const reviews = getReviewsForSpecialist(specialist.slug);
  const socialEntries = Object.entries(specialist.socialLinks ?? {});
  const videoEmbedUrl = normalizeVideoEmbedUrl(specialist.videoIntroUrl);

  return (
    <div className="bg-background px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="flex h-56 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                {specialist.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={specialist.avatarUrl}
                    alt={specialist.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-5xl font-semibold">
                    {getInitials(specialist.name)}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">{specialist.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {specialist.specializations.join(" · ")}
                </p>
                <div className="inline-flex items-center gap-1 text-brand">
                  <Star className="h-4 w-4 fill-brand text-brand" />
                  <span className="font-medium">{specialist.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    · {reviews.length} отзывов
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {specialist.phone && (
                  <a
                    href={`tel:${specialist.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-brand hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {specialist.phone}
                  </a>
                )}
                <a
                  href={`mailto:${specialist.email}`}
                  className="flex items-center gap-2 text-brand hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {specialist.email}
                </a>
              </div>

              {socialEntries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialEntries.map(([network, url]) => (
                    <a
                      key={network}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-brand/10 px-3 py-1 text-xs capitalize text-brand hover:bg-brand/15"
                    >
                      {network}
                    </a>
                  ))}
                </div>
              )}

              <Button variant="accent" className="w-full" asChild>
                <a href="#booking">Записаться</a>
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-8">
          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-border md:p-8">
            <h2 className="text-xl font-semibold">О специалисте</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{specialist.bio}</p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-border md:p-8">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">Образование</h2>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {specialist.education}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-border md:p-8">
            <h2 className="text-xl font-semibold">Видео-визитка</h2>
            <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-brand/10">
              {videoEmbedUrl ? (
                <iframe
                  src={videoEmbedUrl}
                  title={`Видео-визитка ${specialist.name}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Видео скоро будет добавлено
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-border md:p-8">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">Отзывы</h2>
            </div>
            {reviews.length === 0 ? (
              <p className="mt-4 text-muted-foreground">Отзывов пока нет.</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-2xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">{review.author}</p>
                      <div className="inline-flex items-center gap-1 text-brand">
                        <Star className="h-4 w-4 fill-brand text-brand" />
                        {review.rating}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {review.text}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {specialist.articles.length > 0 && (
            <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-border md:p-8">
              <h2 className="text-xl font-semibold">Статьи специалиста</h2>
              <ul className="mt-4 space-y-3">
                {specialist.articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-brand hover:underline"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Card
            id="booking"
            className="scroll-mt-24 border-brand/20 bg-brand/5"
          >
            <CardContent className="p-6 md:p-8">
              <BookingForm
                specialistSlug={specialist.slug}
                specialistName={specialist.name}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
