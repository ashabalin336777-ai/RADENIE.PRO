import Link from "next/link";
import { Menu, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/specialists", label: "Специалисты" },
  { href: "/blog", label: "Блог" },
  { href: "/ai-assistant", label: "AI-помощник" },
  { href: "/events", label: "Мероприятия" },
  { href: "/legal", label: "Правила" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-brand text-brand-foreground shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-semibold tracking-wide">РАДЕНИЕ</span>
          <span className="hidden text-xs text-brand-foreground/80 sm:block">
            Центр психологических услуг
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-brand-foreground/90 transition-colors hover:text-brand-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:88002345685"
            className="hidden items-center gap-2 text-sm text-brand-foreground/90 hover:text-brand-foreground md:flex"
          >
            <Phone className="h-4 w-4" />
            8 800 2345685
          </a>
          <Button variant="accent" size="sm" asChild>
            <Link href="/specialists">Записаться</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-brand-foreground/90 hover:bg-brand-foreground/10 lg:hidden"
            aria-label="Меню"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
