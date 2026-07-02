# ADR 0001: TypeScript Monorepo

Дата: 2026-07-02

## Статус

Прийнято для MVP.

## Контекст

EZ MONITOR має web UI, API, worker, shared domain contracts і jsonPTS protocol helpers. Потрібна структура, яка дозволяє швидко розширювати модулі без копіювання типів і без змішування PTS protocol logic з UI.

## Рішення

Використати `pnpm` workspaces:

- `apps/web` - Vue 3 + Vite.
- `apps/api` - NestJS REST API, OpenAPI, PTS ingestion.
- `apps/worker` - фонова нормалізація, alerts, notifications, aggregates.
- `packages/pts-protocol` - jsonPTS types, HMAC, router, response builder, fixtures.
- `packages/domain` - бізнес-типи, RBAC, analytics contracts.
- `packages/ui` - design tokens і майбутні shared компоненти.

## Наслідки

- Shared contracts живуть в packages і версіонуються разом із app code.
- Локальний dev вимагає `pnpm install` на корені.
- Для production треба додати Dockerfiles/CI після стабілізації MVP.
