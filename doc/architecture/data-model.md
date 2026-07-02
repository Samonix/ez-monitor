# Модель Даних

## Tenant boundary

Основна межа доступу - `Organization`. Усі user-facing запити мають фільтруватися за organization і station scope. AI tool gateway також працює тільки через ці межі.

## Основні сутності

- `organizations` - мережа або клієнт.
- `stations` - АЗС із номером, адресою, часовим поясом і статусом.
- `controllers` - PTS-2 пристрої, їх `ptsId`, режим, auth hints, секрети та last seen.
- `raw_pts_packets` - незмінний журнал вхідних/вихідних jsonPTS envelopes для аудиту, replay і debug.
- `pump_transactions`, `tank_measurements`, `in_tank_deliveries`, `alerts`, `payments`, `shifts` - нормалізовані доменні події.
- `fuel_grades`, `pumps`, `nozzles`, `tanks`, `readers` - operational inventory/configuration.
- `cards`, `card_authorizations`, `card_ledger` - MVP карткової системи.
- `notification_subscriptions`, `event_deliveries` - майбутня доставка подій у Telegram/email/webhooks.
- `audit_logs` - слід дій користувачів, API-клієнтів і AI gateway.

## Ідемпотентність

Raw packet отримує `packetFingerprint`, побудований з PTS identity, packet `Id`, `Type` і canonical payload. Нормалізовані таблиці мають додаткові unique ключі, наприклад `controllerId + externalId` для транзакцій і доставок.

## Гроші та об'єми

Гроші, літри, висота, температура і ціна зберігаються як `Decimal`, не `float`. UI може форматувати їх локалізовано, але API має повертати точні decimal strings/числа згідно контракту.
