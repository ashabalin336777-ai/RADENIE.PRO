import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatHourlyRate } from "@/lib/format";
import { getInitials, type SpecialistListItem } from "@/lib/queries/specialists";

type SpecialistCardProps = {
  specialist: SpecialistListItem;
};

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  const rateLabel = formatHourlyRate(specialist.hourlyRateRub);
  const shortBio =
    specialist.bio.length > 140
      ? `${specialist.bio.slice(0, 140).trim()}…`
      : specialist.bio;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-brand">
          {specialist.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={specialist.avatarUrl}
              alt={specialist.name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <span className="text-4xl font-semibold">
              {getInitials(specialist.name)}
            </span>
          )}
        </div>
        <CardTitle>{specialist.name}</CardTitle>
        <CardDescription>{specialist.specializations.join(" · ")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {shortBio ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{shortBio}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 text-sm">
          {rateLabel ? (
            <span className="font-medium text-foreground">{rateLabel}</span>
          ) : (
            <span className="text-muted-foreground">Онлайн и очно</span>
          )}
          <span className="inline-flex items-center gap-1 text-brand">
            <Star className="h-4 w-4 fill-brand text-brand" />
            {specialist.rating.toFixed(1)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-3">
        <Button variant="accent" className="flex-1" asChild>
          <Link href={`/specialists/${specialist.slug}#booking`}>Записаться</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/specialists/${specialist.slug}`}>Профиль</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
