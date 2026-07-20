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
import { getInitials, type SpecialistListItem } from "@/lib/queries/specialists";

type SpecialistCardProps = {
  specialist: SpecialistListItem;
};

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader>
        <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-brand">
          {specialist.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={specialist.avatarUrl}
              alt={specialist.name}
              className="h-full w-full object-cover"
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
      <CardContent className="flex-1">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Онлайн и очно</span>
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
