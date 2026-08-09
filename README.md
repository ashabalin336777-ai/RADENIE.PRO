# РАДЕНИЕ

**Центр психологических услуг и телесной терапии**  
Сайт: [https://radenie.pro](https://radenie.pro)

Репозиторий: [github.com/ashabalin336777-ai/RADENIE.PRO](https://github.com/ashabalin336777-ai/RADENIE.PRO)

MVP: каталог специалистов, AI-помощник, админ-панель и личные кабинеты специалистов, блог и календарь.

**Контакты на сайте:** 8 800 234-56-85 · Новосибирск, ул. Богдана-Хмельницкого, 2 · ra@radenie.pro

---

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | Express (прокси через nginx) |
| БД | PostgreSQL 16, Prisma ORM |
| Auth | NextAuth.js (роли: `ADMIN`, `SPECIALIST`, `CLIENT`) |
| AI | OpenAI SDK → [VseLLM](https://vsellm.ru) (или прямой OpenAI) |
| Деплой | Docker Compose, nginx, HTTPS (порты 80/443) |

---

## Структура проекта

```
RADENIE.PRO/
├── Frontend/                 # Next.js (основной код)
│   ├── app/                  # Страницы, server actions, API routes
│   ├── components/           # UI, админ-панель, кабинет
│   ├── prisma/               # Схема БД и seed
│   └── lib/                  # Prisma, auth, uploads, AI
├── Backend/                  # Express (/health, аварийный reset-admin)
├── nginx/                    # Reverse proxy + HTTPS
│   └── certs/                # SSL на сервере (не в git)
├── scripts/                  # Деплой, HTTPS, сброс пароля
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Роли и кабинеты

| Роль | Вход | Раздел `/admin` |
|------|------|-----------------|
| **ADMIN** | `admin@radenie.pro` | **Админ-панель** — специалисты, выдача/сброс паролей ЛК, календари, статьи, AI центра |
| **SPECIALIST** | email специалиста | **Личный кабинет** — свой профиль (фото, контакты), свой пароль, свой календарь/статьи |
| **CLIENT** | тестовый клиент | без доступа в админку |

Админ может редактировать профили специалистов (имя, телефон, email, фото, bio) и выдавать персональные пароли для ЛК.

---

## Маршруты

| URL | Описание |
|-----|----------|
| `/` | Главная |
| `/specialists` | Каталог с фильтрами |
| `/specialists/[slug]` | Профиль специалиста |
| `/ai-assistant` | AI-помощник для подбора |
| `/legal` | Правила консультирования |
| `/login` | Вход |
| `/admin` | Админ-панель / личный кабинет (по роли) |

---

## Быстрый старт (Docker, локально)

### 1. Переменные окружения

```bash
cp .env.example .env
```

| Переменная | Описание |
|------------|----------|
| `VSELLM_API_KEY` или `OPENAI_API_KEY` | Ключ AI |
| `SESSION_SECRET` / `NEXTAUTH_SECRET` | Случайные строки ≥ 32 символов |
| `NEXTAUTH_URL` | Локально: `http://localhost:8080` |
| `PUBLIC_PORT` | Обычно не нужен для compose с 80/443; см. `.env.example` |
| `ALLOW_ADMIN_RESET` | `0` в проде; `1` только для аварийного сброса |

### 2. Запуск

```bash
docker compose up -d --build
```

### 3. БД

```bash
docker compose exec frontend npx prisma db push
docker compose exec frontend npx prisma db seed
```

### 4. Сайт

```
http://localhost:8080
```

На локальной машине без SSL nginx может слушать 80/443 — при занятости портов скорректируйте `docker-compose.yml`.

---

## Тестовые аккаунты (после seed)

| Email | Роль | Пароль (только при первом создании) |
|-------|------|-------------------------------------|
| `admin@radenie.pro` | Админ | `RadeneAdmin2024!` |
| `elena@radenie.pro` | Специалист | `Elena-Cabinet1!` |
| `marina@radenie.pro` | Специалист | `Marina-Cabinet1!` |
| `dmitry@radenie.pro` | Специалист | `Dmitry-Cabinet1!` |
| `anna@radenie.pro` | Специалист | `Anna-Cabinet1!` |
| `sergey@radenie.pro` | Специалист | `Sergey-Cabinet1!` |
| `client@example.com` | Клиент | `Client-Demo1!` |

Seed **не перезаписывает** уже существующие пароли. На проде пароли задаёт админ в панели.

---

## Локальная разработка (без Docker)

Нужны Node.js 20+ и PostgreSQL 16.

```bash
cd Frontend
npm install
# .env в корне проекта RADENIE.PRO/
npm run db:push
npm run db:seed
npm run dev
```

Приложение: http://localhost:3000

**Windows (PowerShell блокирует npm):** используйте `Frontend/setup.cmd` и `Frontend/dev.cmd`, либо:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Backend (опционально):

```bash
cd Backend && npm install && npm run dev
```

API: http://localhost:4000/health

---

## Деплой на VPS (Timeweb Cloud)

Прод: **https://radenie.pro** (HTTP → HTTPS). Сертификаты лежат на сервере в `nginx/certs/` и **не коммитятся**.

### Важно про сборку frontend

На VPS с ~2 GB RAM `docker compose build frontend` часто падает по OOM. Собирайте образ на машине с Docker Desktop и загружайте на VPS.

### Обновление (Windows → VPS)

1. Собрать и выгрузить образ:

```powershell
cd C:\Users\admin\RADENIE.PRO
.\scripts\export-frontend-image.ps1
```

2. Залить tar и код:

```powershell
scp .\radenie-frontend.tar root@<VPS_IP>:/opt/RADENIE.PRO/
```

3. На VPS:

```bash
cd /opt/RADENIE.PRO
git pull origin master
docker load -i radenie-frontend.tar
# в .env:
#   NEXTAUTH_URL=https://radenie.pro
#   FRONTEND_IMAGE=radeniepro-frontend:latest
#   VSELLM_API_KEY=...
#   NEXTAUTH_SECRET / SESSION_SECRET
docker compose up -d --force-recreate --no-build frontend
docker compose up -d nginx   # если менялся nginx.conf
```

### Первый запуск на сервере

```bash
cp .env.example .env   # заполнить секреты и NEXTAUTH_URL=https://radenie.pro
# положить сертификаты:
#   nginx/certs/radenie.pro.crt
#   nginx/certs/radenie.pro.key
docker compose up -d postgres backend nginx
# frontend — через docker load (см. выше)
docker compose exec frontend npx prisma db push
docker compose exec frontend npx prisma db seed
```

Включить HTTPS-конфиг (если ещё не применён): `scripts/enable-https.sh`.

### Аварийный сброс пароля admin

Только временно:

1. В `.env`: `ALLOW_ADMIN_RESET=1`, `ADMIN_RESET_TOKEN=<случайный>`
2. Пересоздать backend/frontend
3. `POST /api/reset-admin` с токеном (см. Backend) или SQL `scripts/reset-admin.sql`
4. Сразу вернуть `ALLOW_ADMIN_RESET=0`

---

## Полезные команды

```bash
# Frontend — БД
cd Frontend
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio

# Docker
docker compose up -d
docker compose logs -f frontend
docker compose down
```

---

## Секреты и git

В репозиторий **не** попадают:

- `.env`
- SSL-ключи (`SSL/`, `nginx/certs/*.key`, `*.pem`)
- экспорты образов (`*.tar`)
- загруженные аватары (`Frontend/uploads/`)

Публикуйте только `.env.example`. Сертификаты Timeweb храните на VPS или в отдельном безопасном хранилище.

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
