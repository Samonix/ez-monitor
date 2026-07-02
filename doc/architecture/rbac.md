# RBAC

## Ролі MVP

- `owner` - повний доступ до organization.
- `admin` - користувачі, ролі, станції, контролери, налаштування.
- `manager` - dashboard, звіти, транзакції, резервуари, alerts.
- `operator` - операційний моніторинг станції, alerts, зміни.
- `service` - контролери, конфігурація, технічні логи, без фінансових агрегатів за замовчуванням.
- `auditor` - read-only доступ до журналів, транзакцій, звітів.
- `card-manager` - картки, ліміти, ledger, авторизації.

## Station scopes

Користувач може мати роль на рівні всієї organization і додатково station-scoped доступ. Усі endpoints, включно з analytics, повинні перевіряти список дозволених stations.

## Permission приклади

- `stations.read`, `stations.manage`
- `transactions.read`, `reports.read`
- `alerts.read`, `alerts.acknowledge`
- `cards.read`, `cards.manage`, `cards.authorize`
- `controllers.read`, `controllers.manage`, `pts.ingest`
- `users.manage`, `roles.manage`, `audit.read`
- `analytics.ai.read`

## Audit

Кожна зміна ролей, карток, controller secrets і AI-запит до analytics пишеться в `audit_logs`.
