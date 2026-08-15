/** Форматирование тарифа: «4 500 ₽ / час» */
export function formatHourlyRate(rub: number | null | undefined): string | null {
  if (rub == null || !Number.isFinite(rub)) return null;
  return `${new Intl.NumberFormat("ru-RU").format(rub)} ₽ / час`;
}
