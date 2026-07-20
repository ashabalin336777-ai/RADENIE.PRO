# РАДЕНИЕ

**Центр психологических услуг и телесной терапии**  
Сайт: [radenie.pro](https://radenie.pro)

MVP веб-приложения: каталог специалистов, AI-помощник для подбора, админ-панель, блог и календарь (задел).

---

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | Express (прокси через nginx) |
| БД | PostgreSQL, Prisma ORM |
| Auth | NextAuth.js (роли: ADMIN, SPECIALIST, CLIENT) |
| AI | OpenAI SDK → VseLLM API |
| Деплой | Docker Compose, nginx |

---

## Структура проекта

```
RADENIE.PRO/
├── Frontend/          # Next.js приложение (основной код)
│   ├── app/           # Страницы и API routes
│   ├── components/    # UI-компоненты
│   ├── prisma/        # Схема БД и seed
│   └── lib/           # Утилиты, Prisma, auth
├── Backend/           # Express API (/api/health)
├── nginx/             # Reverse proxy
├── docker-compose.yml
├── .env.example       # Шаблон секретов (скопировать в .env)
└── README.md
```

---

## Быстрый старт (Docker)

### 1. Настройте переменные окружения

```bash
cp .env.example .env
```

Заполните в `.env`:

| Переменная | Описание |
|------------|----------|
| `OPENAI_API_KEY` | Ключ VseLLM / OpenAI |
| `SESSION_SECRET` | Длинная случайная строка (≥ 32 символов) |
| `NEXTAUTH_SECRET` | То же или отдельная строка для NextAuth |
| `PUBLIC_PORT` | `8080` локально, `80` на сервере |

### 2. Запуск

```bash
docker compose up -d --build
```

### 3. Инициализация базы данных

```bash
docker compose exec frontend npx prisma db push
docker compose exec frontend npx prisma db seed
```

### 4. Открыть в браузере

```
http://localhost:8080
```

(или `http://<IP>` при `PUBLIC_PORT=80`)

---

## Локальная разработка (без Docker)

### Требования

- Node.js 20+
- PostgreSQL 16

### Frontend

```bash
cd Frontend
npm install
cp ../.env.example ../.env   # отредактируйте DATABASE_URL и секреты
npm run db:push
npm run db:seed
npm run dev
```

Приложение: http://localhost:3000

#### Windows (PowerShell блокирует npm)

Если видите ошибку *«выполнение сценариев отключено»*, используйте **cmd-файлы** или `npm.cmd`:

```cmd
cd Frontend
setup.cmd      :: первый раз: install + db:push + seed
dev.cmd        :: запуск dev-сервера
```

Либо в PowerShell один раз:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

> `.env` лежит в **корне** проекта (`RADENIE.PRO/.env`). Frontend подхватывает его автоматически.

### Backend (опционально)

```bash
cd Backend
npm install
npm run dev
```

API: http://localhost:4000/health

---

## Маршруты приложения

| URL | Описание |
|-----|----------|
| `/` | Главная |
| `/specialists` | Каталог специалистов с фильтрами |
| `/specialists/[slug]` | Профиль специалиста |
| `/ai-assistant` | AI-помощник для подбора |
| `/legal` | Правила консультирования |
| `/login` | Вход для специалистов |
| `/admin` | Админ-панель (защищена) |

---

## Тестовые аккаунты (после seed)

Пароль для всех: `Radene2024!`

| Email | Роль |
|-------|------|
| `elena@radenie.pro` | Специалист |
| `marina@radenie.pro` | Специалист |
| `admin@radenie.pro` | Администратор |
| `client@example.com` | Клиент |

---

## Полезные команды

```bash
# Frontend — БД
cd Frontend
npm run db:generate   # Prisma Client
npm run db:push       # Применить схему
npm run db:migrate    # Миграции (dev)
npm run db:seed       # Тестовые данные
npm run db:studio     # Prisma Studio

# Сборка
npm run build
npm run start

# Docker
docker compose up -d --build
docker compose down
docker compose logs -f frontend
```

---

## Публикация на GitHub

```bash
git init
git add .
git commit -m "Initial commit: RADENIE MVP"
git branch -M main
git remote add origin https://github.com/<user>/radenie.pro.git
git push -u origin main
```

> **Важно:** файл `.env` с секретами в репозиторий не попадает (см. `.gitignore`).  
> В Git публикуйте только `.env.example`.

---

## Деплой на Timeweb Cloud

1. Создайте PostgreSQL и скопируйте `DATABASE_URL` в `.env`
2. Укажите `PUBLIC_PORT=80`, `NEXTAUTH_URL=https://radenie.pro`
3. Задайте `OPENAI_API_KEY`, `SESSION_SECRET`, `NEXTAUTH_SECRET`
4. Запустите: `docker compose up -d --build`
5. Выполните миграции и seed (см. выше)

---

## Дизайн-система (60/30/10)

| Доля | Цвет | Назначение |
|------|------|------------|
| 60% | `#FAFAF9` | Фон |
| 30% | `#2C7A7B` | Шапка, подвал, бренд |
| 10% | `#F687B3` | Кнопки «Записаться» |

---

## Лицензия

Proprietary · © РАДЕНИЕ · radenie.pro
