export type Review = {
  id: string;
  author: string;
  text: string;
  rating: number;
  date: string;
};

export const specialistReviews: Record<string, Review[]> = {
  "elena-volkova": [
    {
      id: "1",
      author: "Мария К.",
      text: "Елена помогла нам с партнёром вернуть диалог. Очень бережный и профессиональный подход.",
      rating: 5,
      date: "2026-03-12",
    },
    {
      id: "2",
      author: "Алексей",
      text: "Чувствовал себя в безопасности с первой сессии. Рекомендую.",
      rating: 5,
      date: "2026-02-04",
    },
  ],
  "marina-sokolova": [
    {
      id: "1",
      author: "Ольга",
      text: "Метод Весисвет помог прожить накопившуюся тревогу. Тело откликнулось сразу.",
      rating: 5,
      date: "2026-01-20",
    },
  ],
  "dmitry-orlov": [
    {
      id: "1",
      author: "Игорь",
      text: "Расстановка про деньги изменила моё отношение к работе и семейным сценариям.",
      rating: 5,
      date: "2026-03-01",
    },
  ],
  "anna-kuznetsova": [
    {
      id: "1",
      author: "Екатерина",
      text: "Анна помогла выстроить границы и научиться заботиться о себе без чувства вины.",
      rating: 5,
      date: "2026-02-18",
    },
  ],
  "sergey-ilin": [
    {
      id: "1",
      author: "Денис",
      text: "После нескольких сессий телесной терапии стало легче спать и меньше зажимов в теле.",
      rating: 5,
      date: "2026-01-30",
    },
  ],
};

export function getReviewsForSpecialist(slug: string): Review[] {
  return specialistReviews[slug] ?? [];
}
