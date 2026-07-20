"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type SpecialistFilterProps = {
  specializations: string[];
};

export function SpecialistFilter({ specializations }: SpecialistFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("specialization");

  function hrefFor(value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("specialization", value);
    } else {
      params.delete("specialization");
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const items = [{ label: "Все", value: undefined }, ...specializations.map((spec) => ({
    label: spec,
    value: spec,
  }))];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const isActive = active === item.value || (!active && !item.value);
        return (
          <Link
            key={item.label}
            href={hrefFor(item.value)}
            className={cn(
              "rounded-2xl px-4 py-2 text-sm transition-colors",
              isActive
                ? "bg-brand text-brand-foreground shadow-soft"
                : "bg-white text-foreground ring-1 ring-border hover:bg-brand/5"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
