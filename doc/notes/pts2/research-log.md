# Research Log

Дата: 2026-07-02

## Локальні джерела

- `vendor/documents/PTS-2-forecourt-controller-technical-guide.pdf` - огляд пристрою, remote server сценарії, PTS-2 можливості.
- `vendor/documents/jsonPTS protocol for PTS-2 controller.pdf` - jsonPTS envelope, upload packets, cards/tags, auth/HMAC.

## Web джерела

- PTS-2: https://www.technotrade.ua/pts2-forecourt-controller.html
- PTS Monitor: https://www.technotrade.ua/monitor-server.html
- NaftaCards/fuel card system: https://www.technotrade.ua/fuel-card-system.html
- Remote monitoring alerts: https://www.technotrade.ua/remote-monitoring-over-petrol-station-activity-and-alerts
- Remote control and monitoring: https://www.technotrade.ua/remotely-control-and-monitor-petrol-stations-and-fuel-delivery-trucks

## Тестовий controller

- `http://192.168.1.116/` - тестовий PTS-2 у локальній мережі.
- 2026-07-02: ping доступний, HTTP root без auth повертає `401 Unauthorized`.
- 2026-07-02: Basic auth read-only доступ відкрив SPA UI; знайдені сторінки device information, configuration, fuel prices, pumps, tanks, reports, logging, diagnostics, firmware update.
- Поточні сторонні параметри remote server не фіксуємо й не використовуємо; для EZ MONITOR вони будуть задані окремо під наш сервер.

## Висновки для MVP

- Починати з HTTP/HTTPS automatic upload, бо controller може сам підключатися до серверу.
- Окремо передбачити user-initiated read requests із кабінету: користувач відкриває сторінку АЗС/ПРК/резервуарів або натискає refresh, backend читає актуальні дані з PTS-2 через контрольований канал.
- Зберігати raw packet до нормалізації.
- Не включати remote pump control у MVP без тестування реального controller UI і safety rules.
- Проєктувати cards module як окремий bounded context, але інтегрувати ledger із pump transactions.
- AI-доступ робити через read-only analytics API з RBAC і audit.