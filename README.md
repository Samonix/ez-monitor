# EZ MONITOR

EZ MONITOR - вебкабінет для мережі АЗС на базі PTS-2 forecourt controllers. MVP приймає дані від контролерів, показує live-стан станцій, транзакції, резервуари, події/alerts і базовий модуль карток/тегів.

## Структура

- `apps/api` - NestJS API, OpenAPI, PTS HTTP ingestion, WebSocket skeleton.
- `apps/web` - Vue 3 + Vite кабінет MVP.
- `apps/worker` - фонові normalizers, alert rules, notifications.
- `packages/pts-protocol` - jsonPTS типи, HMAC, response builder, fixtures.
- `packages/domain` - бізнес-типи, RBAC, analytics helpers.
- `packages/ui` - design tokens.
- `db/prisma/schema.prisma` - PostgreSQL модель.
- `vendor/documents` - локальні PDF від постачальника.
- `vendor/prototype` - vendor-прототипи UI/стилів для контексту.
- `doc/` і `.agents/` - документаційний flow, архітектура, PTS-2 нотатки, задачі та агентські інструкції.

## Режими обміну з PTS-2

1. Automatic upload: PTS-2 сам періодично надсилає `UploadPumpTransaction`, `UploadTankMeasurement`, `UploadInTankDelivery`, `UploadAlertRecord`, `UploadPayment`, `UploadShift`, `UploadConfiguration`, `UploadStatus` і `RequestTagsInformation`.
2. User-initiated read requests: користувач у кабінеті відкриває сторінку АЗС/ПРК/резервуарів або натискає refresh, а backend читає актуальні дані з конкретного PTS-2 через контрольований read-only flow.

Remote pump control не входить у MVP.

## Запуск

```bash
pnpm install
docker compose -f infra/docker/docker-compose.yml up -d
pnpm db:generate
pnpm dev
```

## Головні endpoint-и

- `POST /pts/jsonPTS`
- `POST /jsonPTS`
- `POST /api/v1/jsonPTS`
- `GET /api/v1/openapi.json`
- `GET /api/v1/stations`
- `GET /api/v1/stations/:id/summary`
- `GET /api/v1/stations/:id/transactions`
- `GET /api/v1/stations/:id/tanks`
- `GET /api/v1/alerts`
- `GET/POST/PATCH /api/v1/cards`
- `GET /api/v1/analytics/revenue`

`vendor/**` не змінювати без окремого запиту.