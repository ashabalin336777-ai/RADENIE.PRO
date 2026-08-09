import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const footerLinks = [
  { href: "/specialists", label: "Специалисты" },
  { href: "/blog", label: "Блог" },
  { href: "/ai-assistant", label: "AI-помощник" },
  { href: "/legal", label: "Правила консультирования" },
];

export function Footer() {
  return (
    <footer className="bg-brand text-brand-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3 md:px-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">РАДЕНИЕ</h2>
          <p className="text-sm leading-relaxed text-brand-foreground/85">
            Центр психологических услуг и телесной терапии. Бережная поддержка
            на пути к себе и гармонии в отношениях.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-foreground/90">
            Навигация
          </h3>
          <ul className="space-y-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-brand-foreground/85 transition-colors hover:text-brand-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-foreground/90">
            Контакты
          </h3>
          <ul className="space-y-3 text-sm text-brand-foreground/85">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Новосибирск, ул.Богдана-Хмельницкого, 2</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a href="tel:88002345685" className="hover:text-brand-foreground">
                8 800 2345685
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a
                href="mailto:ra@radenie.pro"
                className="hover:text-brand-foreground"
              >
                ra@radenie.pro
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-brand-foreground/70 md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} РАДЕНИЕ · radenie.pro</p>
          <p>Информация на сайте не является медицинской консультацией</p>
        </div>
      </div>
    </footer>
  );
}
