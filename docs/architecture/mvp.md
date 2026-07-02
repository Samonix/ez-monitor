# MVP EZ MONITOR

## Мета

EZ MONITOR - вебкабінет для мережі АЗС, який приймає дані від PTS-2 controller, показує операційний стан станцій, транзакції, резервуари, події/аварії та базову карткову систему.

## У MVP входить

- Організації, АЗС, PTS-2 контролери, користувачі, ролі та station scopes.
- HTTP ingestion для jsonPTS upload-пакетів від PTS-2.
- Збереження raw packets перед нормалізацією.
- Ідемпотентна обробка upload-пакетів.
- Live-oriented UI: dashboard мережі, сторінка АЗС, насоси, резервуари, останні транзакції, alerts.
- Картки/теги: список, статус, баланс, ліміти, дозволені типи палива, базовий `RequestTagsInformation` flow.
- OpenAPI endpoint для інтеграцій і майбутнього AI tool gateway.
- Початкова worker-структура для alert rules, notification fan-out і агрегатів.

## Не входить у MVP

- Віддалене керування насосами та safety-critical команди.
- Повна billing/card clearing логіка.
- Production SSO, multi-region deployment, повна observability.
- Прямий доступ AI до БД.

## Перший success criteria

1. PTS-2 або mock sender надсилає `UploadPumpTransaction`, API повертає confirmation і зберігає raw packet.
2. Повторний пакет не створює дубль транзакції.
3. UI показує мережевий summary, стан АЗС №4, транзакції, резервуари та картки.
4. `RequestTagsInformation` повертає безпечну відповідь для активної картки або відмову для blocked/unknown tag.
5. OpenAPI доступний за `/api/v1/openapi.json`.
