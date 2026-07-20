import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Правила консультирования",
};

export default function LegalPage() {
  return (
    <div className="bg-background px-4 py-16 md:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-semibold">Правила консультирования</h1>
        <div className="space-y-6 rounded-2xl bg-white p-8 shadow-soft ring-1 ring-border">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Общие положения</h2>
            <p className="leading-relaxed text-muted-foreground">
              Консультации в центре РАДЕНИЕ носят психологический и
              консультативный характер и не заменяют медицинскую помощь.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Конфиденциальность</h2>
            <p className="leading-relaxed text-muted-foreground">
              Информация, полученная в ходе сессий, не передаётся третьим лицам,
              за исключением случаев, предусмотренных законодательством РФ.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Договор оказания услуг</h2>
            <p className="leading-relaxed text-muted-foreground">
              Перед началом работы клиент получает договор и информированное
              согласие. Оплата и отмена записи регулируются условиями договора.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
