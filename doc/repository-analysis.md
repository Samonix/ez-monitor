# Аналіз репозиторію

Дата: 2026-07-02

## Поточний стан

EZ MONITOR стартує як TypeScript monorepo з `pnpm` workspaces:

- `apps/web` - Vue 3 + Vite кабінет MVP.
- `apps/api` - NestJS API, OpenAPI, PTS HTTP ingestion.
- `apps/worker` - фонова обробка для normalizers, alerts, notifications.
- `packages/pts-protocol` - jsonPTS типи, HMAC, response builder, fixtures.
- `packages/domain` - бізнес-типи, RBAC, analytics helpers.
- `packages/ui` - design tokens.

## Документаційна модель

- `doc/` - власна документація проєкту.
- `vendor/` - зовнішні матеріали постачальника, PDF і прототипи UI. Не редагувати без прямого запиту.
- `.agents/` - ролі AI-агентів і робочі інструкції.

## Ключові ризики

- PTS-2 має два режими взаємодії: automatic upload і user-initiated read requests. Їх не можна змішувати з remote pump control.
- AI-доступ до бізнес-даних має йти тільки через read-only API з RBAC і audit.
- Карткова система має вплив на фінансові баланси, тому ledger і idempotency критичні.

## Наступний фокус

1. Додати реальні tests для `packages/pts-protocol`.
2. Формалізувати user-initiated read flow для live-сторінки ПРК.
3. Розбити MVP requirements на задачі в `doc/tasks/`.
4. Підготувати production deployment ADR після вибору VPS/cloud/domain.
