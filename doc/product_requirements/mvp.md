# MVP Requirements

## Must have

- Авторизація користувачів і RBAC foundation.
- Організації, АЗС, PTS-2 контролери.
- Automatic HTTP upload ingestion від PTS-2.
- Raw packet storage та idempotency.
- Dashboard мережі, сторінка АЗС, транзакції, резервуари, alerts.
- Базовий cards/tags module і `RequestTagsInformation` flow.
- OpenAPI JSON.

## Should have

- Worker skeleton для notifications/aggregates.
- User-initiated read request architecture.
- AI tool gateway architecture.

## Out of scope

- Remote pump control.
- Production billing/card clearing.
- Прямий AI-доступ до БД.
