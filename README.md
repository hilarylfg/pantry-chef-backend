# PantryChef Backend

Backend для **PantryChef** — умного помощника для холодильника. Пользователь добавляет продукты (вручную, сканируя штрих-коды или фотографируя полки), а ИИ генерирует рецепты, планы питания, списки покупок и предупреждения об истекающих сроках годности.

---

## Стек технологий

| Категория | Технология |
|---|---|
| **Framework** | NestJS 11 (TypeScript 5.7, Node 24) |
| **База данных** | PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| **Сессии** | express-session + Redis (connect-redis v9 / node-redis v6) |
| **AI** | Vercel AI SDK 7 + OpenRouter (модели: GPT-4, Claude, Gemini и др.) |
| **Валидация** | class-validator + class-transformer |
| **Валидация AI-ответов** | Zod 4 (структурированные схемы) |
| **Авторизация** | Cookie-сессии (без JWT), argon2-хеширование паролей |
| **OAuth** | Google, Yandex, GitHub |
| **2FA** | TOTP (двухфакторная аутентификация) |
| **Почта** | @nestjs-modules/mailer + React Email (через Resend SMTP) |
| **Форматирование** | Prettier + @trivago/prettier-plugin-sort-imports |
| **Линтер** | ESLint 9 + typescript-eslint 8 |

---

## Архитектура

```
src/
├── main.ts                     # Bootstrap: сессии (Redis), CORS, cookies, ValidationPipe
├── app.module.ts               # Корневой модуль
│
├── prisma/                     # PrismaModule (global) + PrismaService
├── generated/prisma/           # Сгенерированный Prisma-клиент (не редактировать)
│
├── auth/                       # Аутентификация и авторизация
│   ├── auth.controller.ts      # register, login, logout, OAuth callback
│   ├── auth.service.ts
│   ├── guards/                 # AuthGuard, RolesGuard, AuthProviderGuard
│   ├── decorators/             # @Authorization(), @Authorized(), @Roles()
│   ├── provider/               # OAuth-провайдеры (Google, Yandex, GitHub)
│   ├── email-confirmation/     # Подтверждение email по токену
│   ├── password-recovery/      # Сброс пароля по email
│   └── two-factor-auth/        # 2FA через TOTP
│
├── user/                       # Управление пользователем
│   └── user.controller.ts      # GET /users/me, PATCH /users/me
│
├── products/                   # Управление продуктами (CRUD)
│   └── products.controller.ts  # GET/POST/PATCH/DELETE /products, GET /products/expiring
│
├── recipes/                    # Управление рецептами
│   └── recipes.controller.ts   # CRUD + POST /recipes/generate (AI-генерация)
│
├── ai/                         # AI-модуль
│   ├── ai.service.ts           # streamChat, generateRecipe
│   ├── ai.controller.ts        # POST /ai/stream, POST /ai/scan-qr
│   ├── vision.service.ts       # scanPhoto (TODO), parseQrCode (TODO)
│   ├── providers/              # OpenRouter-клиент как NestJS-провайдер
│   ├── prompts/                # Tagged template builders для user-промптов
│   └── types/                  # Системные промпты, Zod-схемы, константы
│
├── config/                     # Конфигурация (OAuth, Mailer)
└── libs/                       # Общие утилиты, типы, почта
    ├── common/                 # Типы (продукты, рецепты), утилиты
    └── mail/                   # MailModule + MailService
```

---

## Что реализовано

### Аутентификация и пользователи

- Регистрация / логин / логаут (cookie-сессии в Redis)
- OAuth: Google, Yandex, GitHub
- Подтверждение email по токену
- Сброс пароля по email
- Двухфакторная аутентификация (TOTP)
- Ролевая модель (`REGULAR` / `ADMIN`)
- Гварды и декораторы: `@Authorization()`, `@Authorized('id')`, `@Roles()`

### Продукты

Полный CRUD + доп. эндпоинты:

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/products` | Список продуктов (пагинация, сортировка, фильтр по категории) |
| `POST` | `/products` | Добавить продукт |
| `GET` | `/products/:id` | Получить продукт по ID |
| `PATCH` | `/products/:id` | Обновить продукт |
| `DELETE` | `/products/:id` | Удалить продукт |
| `GET` | `/products/expiring` | Продукты с истекающим сроком годности |
| `POST` | `/products/:id/consume` | Уменьшить количество продукта |

Категории: dairy, meat, poultry, fish, seafood, eggs, vegetables, fruits, grains, pasta, bread, bakery, canned, frozen, spices, oils, sauces, beverages, snacks, sweets, other.

Единицы: g, kg, ml, l, tbsp, tsp, piece, cup, pinch, pack, bottle, jar.

### Рецепты

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/recipes` | Список рецептов (пагинация, сортировка) |
| `GET` | `/recipes/:id` | Получить рецепт по ID |
| `POST` | `/recipes/generate` | Сгенерировать рецепт(ы) через AI |
| `PATCH` | `/recipes/:id` | Обновить рецепт |
| `DELETE` | `/recipes/:id` | Удалить рецепт |

AI-генерация рецептов:
- Пользователь передаёт параметры: maxTimeMinutes, difficulty, cuisine, mealType, servings, diet, options.count
- Сервис берёт продукты пользователя из БД, строит промпт через `buildRecipeUserPrompt()`
- LLM возвращает структурированный JSON (через Zod-схему `RecipesSchema`)
- Рецепты сохраняются в БД и возвращаются клиенту

### AI-модуль

- **OpenRouter** как единый провайдер LLM (GPT-4, Claude, Gemini, Llama и 100+ других моделей)
- **Стриминг чата**: `POST /ai/stream` — потоковый ответ от LLM
- **Структурированные ответы**: Zod-схемы гарантируют валидный JSON от LLM
- **Промпт-инжиниринг**: tagged template literals (`tmpl()`) для построения промптов в чистом TS, без Handlebars
- **6 системных промптов**: RECIPE, VISION, MEAL_PLAN, SHOPPING_LIST, EXPIRY_ALERT, FALLBACK
- **4 билдера промптов**: recipe, meal-plan, shopping-list, expiry-alert

### Почта

- React Email-шаблоны (HTML)
- SMTP через Resend
- Подтверждение регистрации, сброс пароля

---

## Что запланировано

### Распознавание продуктов по фото (Vision)
- `POST /ai/scan-photo` — загрузка фото полок холодильника
- Vision-модель распознаёт продукты, их количество, категорию, срок годности
- Возвращает список с confidence-score, пометками для подтверждения
- Подтверждение пачкой: `POST /ai/batch-confirm`

### QR / DataMatrix сканирование
- `POST /ai/scan-qr` — парсинг штрих-кодов (GS1, DataMatrix, Честный ЗНАК)
- Автоматическое извлечение названия, веса, категории из БД продуктов

### Планы питания
- Генерация меню на N дней с учётом доступных продуктов
- Распределение скоропортящихся продуктов в первые дни
- Учёт диеты, бюджета, предпочтений по кухням

### Списки покупок
- Автоматическая генерация списка на основе выбранных рецептов
- Группировка по категориям, приоритеты
- Сравнение с тем, что уже есть в холодильнике

### Алерты об истечении сроков
- Уведомления о скоропортящихся продуктах
- Рекомендации по использованию (приготовить, заморозить, проверить)
- Интеграция с планом питания

### Дополнительно
- Telegram-бот для уведомлений и управления
- Дашборд статистики (сколько продуктов испортилось, сколько рецептов приготовлено)
- Swagger/OpenAPI документация
- Тесты (unit + e2e)
- Docker-окружение

---

## Модели данных (Prisma)

```
User          — пользователи (email, password, displayName, role, isVerified, 2FA)
Account       — OAuth-аккаунты (provider, tokens)
Token         — верификационные токены (email, 2FA, password reset)
Product       — продукты пользователя (name, category, amount, unit, expiryDate)
Recipe        — рецепты (title, ingredients[JSON], steps[JSON], isFavorite)
```

**Запланированные модели:**
```
MealPlan          — планы питания
ShoppingList      — списки покупок
ShoppingListItem  — элементы списка покупок
Feedback          — обратная связь
```

---

## Установка и запуск

### Требования

- Node.js 24+
- PostgreSQL 16+
- Redis 7+

### Шаги

```bash
# 1. Установить зависимости
bun install

# 2. Настроить переменные окружения
cp .env.example .env
# Заполнить: DATABASE_URL, REDIS_URI, SESSION_SECRET, OPENROUTER_API_KEY, SMTP_*, OAuth-ключи

# 3. Применить миграции БД
npx prisma migrate dev

# 4. (Опционально) Заполнить БД тестовыми данными
bun run db:seed

# 5. Запустить в режиме разработки
bun run start:dev
```

Сервер запустится на `http://localhost:4000` (или порт из `APPLICATION_PORT`).

---

## Переменные окружения

```env
# App
APPLICATION_PORT=4000
ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pantry_chef

# Redis
REDIS_URI=redis://localhost:6379
SESSION_FOLDER=pantry-chef:sess:

# Session
SESSION_SECRET=your-secret-key
SESSION_NAME=pantry.sid
SESSION_MAX_AGE=7d
SESSION_HTTP_ONLY=true
SESSION_SECURE=false
SESSION_SAME_SITE=lax

# Cookies
COOKIES_SECRET=your-cookies-secret

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-xxx

# Mail (Resend)
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USER=resend
MAIL_PASSWORD=re_xxx
MAIL_FROM="PantryChef <noreply@domain.com>"

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
YANDEX_CLIENT_ID=xxx
YANDEX_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

---

## Скрипты

```bash
bun run build          # Сборка
bun run start:dev      # Dev-режим (hot reload)
bun run start:prod     # Production-режим

bun run lint           # ESLint
bun run format         # Prettier

bun run test           # Unit-тесты (Jest)
bun run test:e2e       # E2E-тесты
bun run test:cov       # Покрытие тестами

bun run db:seed        # Сидирование БД
bun run db:reset       # Сброс БД (migrate reset)
```

---

## Ключевые архитектурные решения

1. **Cookie-сессии вместо JWT** — сессии хранятся в Redis, stateless-клиент, простая инвалидация, защита от CSRF.
2. **OpenRouter как единый AI-провайдер** — один API-ключ для доступа к 100+ моделям (GPT-4, Claude, Gemini, Llama).
3. **Zod-схемы для AI-ответов** — LLM возвращает структурированный JSON, валидируемый Zod. Гарантия типов на стороне сервера.
4. **Tagged template literals для промптов** — вместо Handlebars. Чистый TS, ноль зависимостей, типобезопасная интерполяция.
5. **Prisma 7 с driver adapter** — `@prisma/adapter-pg` для прямого подключения к PostgreSQL без промежуточных слоёв.
6. **Глобальный PrismaModule** — один экземпляр PrismaClient на всё приложение.

---

## Структура AI-промптов

| Промпт | Назначение | Статус |
|---|---|---|
| `RECIPE_SYSTEM_PROMPT` | Системный промпт для генерации рецептов | Готов |
| `VISION_SYSTEM_PROMPT` | Распознавание продуктов на фото | Готов |
| `MEAL_PLAN_SYSTEM_PROMPT` | Планирование питания на N дней | Готов |
| `SHOPPING_LIST_SYSTEM_PROMPT` | Составление списка покупок | Готов |
| `EXPIRY_ALERT_PROMPT` | Алерты об истекающих сроках | Готов |
| `FALLBACK_SYSTEM_PROMPT` | Запасной промпт при ошибках LLM | Готов |

Билдеры (tagged template): `buildRecipeUserPrompt`, `buildMealPlanUserPrompt`, `buildShoppingListUserPrompt`, `buildExpiryAlertUserPrompt`.
