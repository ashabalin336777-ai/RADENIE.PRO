import type { Metadata } from "next";
import { Suspense } from "react";

import { SpecialistCard } from "@/components/specialists/specialist-card";
import { SpecialistFilter } from "@/components/specialists/specialist-filter";
import {
  getSpecialists,
  getSpecializations,
} from "@/lib/queries/specialists";

export const metadata: Metadata = {
  title: "Специалисты",
  description: "Каталог психологов и телесных терапевтов центра РАДЕНИЕ",
};

type PageProps = {
  searchParams: { specialization?: string };
};

export default async function SpecialistsPage({ searchParams }: PageProps) {
  const specialization = searchParams.specialization;
  const [specializations, specialists] = await Promise.all([
    getSpecializations(),
    getSpecialists(specialization),
  ]);

  return (
    <div className="bg-background px-4 py-16 md:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-foreground">Специалисты</h1>
          <p className="max-w-2xl text-muted-foreground">
            Выберите специалиста по направлению или воспользуйтесь{" "}
            <a href="/ai-assistant" className="text-brand underline-offset-4 hover:underline">
              AI-помощником
            </a>{" "}
            для подбора.
          </p>
        </div>

        <Suspense fallback={<div className="h-10 animate-pulse rounded-2xl bg-brand/10" />}>
          <SpecialistFilter specializations={specializations} />
        </Suspense>

        {specialists.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-soft ring-1 ring-border">
            <p className="text-muted-foreground">
              По выбранной специализации специалистов не найдено.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {specialists.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
