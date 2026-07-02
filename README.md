# EZ MONITOR

EZ MONITOR - вебкабінет для мережі АЗС, який приймає дані від PTS-2 forecourt controllers, показує live-стан станцій, звіти, alerts і базовий модуль карток/тегів.

## Структура

- `apps/api` - NestJS API, OpenAPI, PTS HTTP ingestion, WebSocket skeleton.
- `apps/web` - Vue 3 + Vite кабінет MVP.
- `apps/worker` - фонові normalizers, alert rules, notifications.
- `packages/pts-protocol` - jsonPTS типи, HMAC, response builder, fixtures.
- `packages/domain` - бізнес-типи, RBAC, analytics helpers.
- `packages/ui` - design tokens.
- `db/prisma/schema.prisma` - PostgreSQL модель.
- `docs/` і `.agents/` - архітектура, PTS-2 нотатки, агентські флоу.

## Запуск

```bash
pnpm install
docker compose -f infra/docker/docker-compose.yml up -d
pnpm db:generate
pnpm dev
```

## Головні endpoint-и

- `POST /pts/jsonPTS`
- `GET /api/v1/openapi.json`
- `GET /api/v1/stations`
- `GET /api/v1/stations/:id/summary`
- `GET /api/v1/stations/:id/transactions`
- `GET /api/v1/stations/:id/tanks`
- `GET /api/v1/alerts`
- `GET/POST/PATCH /api/v1/cards`
- `GET /api/v1/analytics/revenue`

`doc/vendor/**` не змінювати без окремого запиту.