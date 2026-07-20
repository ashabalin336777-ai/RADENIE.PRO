import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Radene2024!";

const specializations = [
  {
    name: "Семейный психолог и секс-коучинг",
    description:
      "Работа с парами и семьями: конфликты, близость, сексуальность, восстановление доверия и диалога.",
  },
  {
    name: "Весисвет метод",
    description:
      "Авторская методика телесно-ориентированной терапии для проживания эмоций и снятия телесных блоков.",
  },
  {
    name: "Финансовые расстановки",
    description:
      "Системный подход к отношениям с деньгами, карьерой и семейными сценариями изобилия.",
  },
  {
    name: "Отношения с собой и партнёром",
    description:
      "Поддержка в принятии себя, выстраивании границ и здоровых романтических отношений.",
  },
  {
    name: "Телесная терапия",
    description:
      "Работа через тело: дыхание, мягкие практики, осознанность и интеграция телесного опыта.",
  },
] as const;

const specialists = [
  {
    slug: "elena-volkova",
    name: "Елена Волкова",
    email: "elena@radenie.pro",
    phone: "+7 (495) 111-11-01",
    specialization: specializations[0].name,
    rating: 4.9,
    bio: "Системный семейный психолог и секс-коуч. Помогаю парам возвращать близость, проговаривать сложные темы и находить новые форматы общения.",
    education:
      "МГУ, факультет психологии · Институт сексологии и консультирования · 500+ часов супервизии",
    videoIntroUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    socialLinks: {
      telegram: "https://t.me/radenie_elena",
      instagram: "https://instagram.com/radenie_elena",
    },
  },
  {
    slug: "marina-sokolova",
    name: "Марина Соколова",
    email: "marina@radenie.pro",
    phone: "+7 (495) 111-11-02",
    specialization: specializations[1].name,
    rating: 4.8,
    bio: "Специалист по методу Весисвет. Сопровождаю клиентов в работе с тревогой, выгоранием и телесными реакциями на стресс.",
    education:
      "РГГУ, клиническая психология · Сертификация «Весисвет метод» · Телесно-ориентированная терапия",
    videoIntroUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    socialLinks: {
      telegram: "https://t.me/radenie_marina",
      vk: "https://vk.com/radenie_marina",
    },
  },
  {
    slug: "dmitry-orlov",
    name: "Дмитрий Орлов",
    email: "dmitry@radenie.pro",
    phone: "+7 (495) 111-11-03",
    specialization: specializations[2].name,
    rating: 4.9,
    bio: "Провожу финансовые расстановки и консультации на стыке системной терапии и карьерного коучинга.",
    education:
      "Финансовый университет · Системные расстановки (Hellinger) · Коуч ICF PCC",
    videoIntroUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    socialLinks: {
      telegram: "https://t.me/radenie_dmitry",
      youtube: "https://youtube.com/@radenie_dmitry",
    },
  },
  {
    slug: "anna-kuznetsova",
    name: "Анна Кузнецова",
    email: "anna@radenie.pro",
    phone: "+7 (495) 111-11-04",
    specialization: specializations[3].name,
    rating: 5.0,
    bio: "Помогаю выстраивать бережные отношения с собой и партнёром, работать с самоценностью и эмоциональной зависимостью.",
    education:
      "СПбГУ, психология · Гештальт-терапия · Схема-терапия (ISST)",
    videoIntroUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    socialLinks: {
      telegram: "https://t.me/radenie_anna",
      instagram: "https://instagram.com/radenie_anna",
    },
  },
  {
    slug: "sergey-ilin",
    name: "Сергей Ильин",
    email: "sergey@radenie.pro",
    phone: "+7 (495) 111-11-05",
    specialization: specializations[4].name,
    rating: 4.9,
    bio: "Телесный терапевт. Работаю с хроническим напряжением, психосоматикой и восстановлением ресурса через тело.",
    education:
      "МИП, телесно-ориентированная психотерапия · Метод Фельденкрайза · Сomatic Experiencing",
    videoIntroUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    socialLinks: {
      telegram: "https://t.me/radenie_sergey",
      youtube: "https://youtube.com/@radenie_sergey",
    },
  },
] as const;

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  for (const item of specializations) {
    await prisma.specialization.upsert({
      where: { name: item.name },
      update: { description: item.description },
      create: item,
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@radenie.pro" },
    update: {},
    create: {
      name: "Администратор РАДЕНИЕ",
      email: "admin@radenie.pro",
      password: passwordHash,
      role: Role.ADMIN,
      phone: "+7 (495) 123-45-67",
    },
  });

  for (const specialist of specialists) {
    const user = await prisma.user.upsert({
      where: { email: specialist.email },
      update: {
        name: specialist.name,
        phone: specialist.phone,
        role: Role.SPECIALIST,
      },
      create: {
        name: specialist.name,
        email: specialist.email,
        password: passwordHash,
        role: Role.SPECIALIST,
        phone: specialist.phone,
        avatarUrl: null,
      },
    });

    await prisma.specialistProfile.upsert({
      where: { userId: user.id },
      update: {
        slug: specialist.slug,
        bio: specialist.bio,
        education: specialist.education,
        specializations: [specialist.specialization],
        videoIntroUrl: specialist.videoIntroUrl,
        socialLinks: specialist.socialLinks,
        rating: specialist.rating,
      },
      create: {
        userId: user.id,
        slug: specialist.slug,
        bio: specialist.bio,
        education: specialist.education,
        specializations: [specialist.specialization],
        videoIntroUrl: specialist.videoIntroUrl,
        socialLinks: specialist.socialLinks,
        rating: specialist.rating,
      },
    });
  }

  const demoClient = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      name: "Тестовый клиент",
      email: "client@example.com",
      password: passwordHash,
      role: Role.CLIENT,
      phone: "+7 (900) 000-00-00",
    },
  });

  const elena = await prisma.specialistProfile.findUnique({
    where: { slug: "elena-volkova" },
  });

  if (elena) {
    const elenaUser = await prisma.user.findUnique({
      where: { email: "elena@radenie.pro" },
    });

    await prisma.aiChatSession.create({
      data: {
        clientId: demoClient.id,
        specialistId: elena.id,
        transcript: JSON.stringify([
          {
            role: "assistant",
            content: "Расскажите, с чем вы хотели бы поработать?",
          },
          {
            role: "user",
            content: "Сложности в отношениях с партнёром, потеря близости.",
          },
          {
            role: "assistant",
            content:
              "Рекомендую семейного психолога Елену Волкову — она специализируется на работе с парами.",
          },
        ]),
      },
    });

    if (elenaUser) {
      const start = new Date();
      start.setDate(start.getDate() + 2);
      start.setHours(14, 0, 0, 0);
      const end = new Date(start);
      end.setHours(15, 0, 0, 0);

      await prisma.appointment.create({
        data: {
          clientId: demoClient.id,
          specialistId: elenaUser.id,
          startTime: start,
          endTime: end,
          status: "PENDING",
        },
      });
    }
  }

  await prisma.event.deleteMany();

  const eventBase = new Date();
  eventBase.setDate(eventBase.getDate() + 14);
  eventBase.setHours(18, 0, 0, 0);

  const event2 = new Date(eventBase);
  event2.setDate(event2.getDate() + 21);
  event2.setHours(11, 0, 0, 0);

  const event3 = new Date(eventBase);
  event3.setDate(event3.getDate() + 35);
  event3.setHours(17, 0, 0, 0);

  await prisma.event.createMany({
    data: [
      {
        title: "Открытая лекция: Близость в паре",
        description:
          "Разберём, как сохранять эмоциональную близость в долгих отношениях. Формат: лекция + Q&A.",
        date: eventBase,
        location: "Москва, ул. Примерная, 10 · зал «Гармония»",
      },
      {
        title: "Практикум «Тело и эмоции»",
        description:
          "Телесно-ориентированная группа для проживания стресса и восстановления ресурса.",
        date: event2,
        location: "Онлайн (Zoom)",
        link: "https://radenie.pro/events/telo-emocii",
      },
      {
        title: "Финансовые расстановки: открытый вечер",
        description:
          "Знакомство с методом, ответы на вопросы, возможность записаться на индивидуальную сессию.",
        date: event3,
        location: "Москва, центр РАДЕНИЕ",
      },
    ],
  });

  const elenaUser = await prisma.user.findUnique({
    where: { email: "elena@radenie.pro" },
  });
  const sergeyUser = await prisma.user.findUnique({
    where: { email: "sergey@radenie.pro" },
  });
  const dmitryUser = await prisma.user.findUnique({
    where: { email: "dmitry@radenie.pro" },
  });

  await prisma.article.deleteMany();

  const seedArticles = [
    {
      slug: "blizost-v-pare",
      title: "Как сохранить близость в паре",
      authorId: elenaUser?.id,
      content: `## Почему мы теряем близость

Близость — это не только физическая, но и эмоциональная связь. Со временем рутина, стресс и непроговорённые обиды могут создавать дистанцию.

## Что можно сделать уже сегодня

1. **Выделите 15 минут без телефонов** — просто поговорите о том, как прошёл день.
2. **Назовите потребность**, а не обвинение.
3. **Обратитесь к специалисту** — парная терапия помогает вернуть диалог.

---

*Если узнали себя — запишитесь на консультацию к семейному психологу центра РАДЕНИЕ.*`,
      published: true,
    },
    {
      slug: "telo-i-emocii",
      title: "Тело помнит: зачем нужна телесная терапия",
      authorId: sergeyUser?.id,
      content: `## Тело и психика — единая система

Эмоции, которые мы не прожили, часто остаются в теле: зажимы в плечах, ком в горле, поверхностное дыхание.

## Что даёт телесная терапия

- Осознанность телесных сигналов
- Мягкое снятие хронического напряжения
- Возвращение чувства опоры и безопасности`,
      published: true,
    },
    {
      slug: "dengi-i-otnosheniya",
      title: "Деньги и отношения: скрытые сценарии",
      authorId: dmitryUser?.id,
      content: `## Деньги — не только про цифры

Наши отношения с деньгами часто связаны с семейной историей.

## Когда стоит обратиться

- Постоянные конфликты о бюджете в паре
- Страх больших сумм или успеха
- Ощущение «я не заслуживаю»`,
      published: true,
    },
  ];

  for (const article of seedArticles) {
    if (!article.authorId) continue;
    await prisma.article.create({
      data: {
        slug: article.slug,
        title: article.title,
        content: article.content,
        authorId: article.authorId,
        published: article.published,
      },
    });
  }

  console.log("Seed completed.");
  console.log(`Default password for test users: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
