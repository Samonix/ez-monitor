# Тестовий PTS-2 Controller

Дата фіксації: 2026-07-02

## Адреса

- URL: `http://192.168.1.116/`
- Призначення: тестовий контролер PTS-2 у локальній мережі для дослідження UI, сторінок контролера та реальної поведінки jsonPTS flows.
- Авторизація: Basic auth перевірено з тимчасовим тестовим обліковим записом; пароль у репозиторій не записувати.

## Межа нотаток

Не фіксувати й не використовувати поточні параметри remote server, які вже прописані в тестовому контролері. Коли прийде час підключати PTS-2 до EZ MONITOR, параметри будуть прописані саме для нашого серверу: наш домен, TLS, auth, HMAC/secret policy та потрібні URI.

## Read-only перевірка доступності

- `Test-Connection 192.168.1.116` -> доступний.
- `GET http://192.168.1.116/` без auth -> `401 Unauthorized`.
- `GET http://192.168.1.116/` з Basic auth -> `200 OK`, `text/html`, SPA UI.
- Статичні assets: `pts.min.css`, `pts.min.js`, `favicon.ico`.

## UI сторінки

- `DeviceInformationPage`
- `ConfigurationPage`
- `FuelGradesPricesPage`
- `PumpsControlPage`
- `TanksMonitoringPage`
- `ReportingPage`
- `LoggingPage`
- `SelfDiagnosticsPage`
- `FirmwareUpdatePage`

## Внутрішня модель UI

UI контролера працює з локальним jsonPTS endpoint і має builders для configuration, pumps, tanks, reports, readers, tags, firmware, self diagnostics та remote server settings. Для EZ MONITOR важливо не поточне значення налаштувань, а підтвердження двох майбутніх режимів:

- automatic upload від PTS-2 до серверу;
- user-initiated запити з кабінету до контролера для актуального читання статусу ПРК, резервуарів, логів, діагностики та інших даних.

## Висновки для EZ MONITOR

- API має підтримувати `/pts/jsonPTS`, `/jsonPTS`, `/api/v1/jsonPTS` для automatic upload на наш сервер.
- MVP має стартувати з HTTP upload; WebSocket лишається feature-flag skeleton.
- `RequestTagsInformation` потрібен у ранньому MVP для cards/tags flow.
- User-initiated read requests мають бути окремим backend flow з RBAC, audit і safety policy.

## Правила безпеки

- Не виконувати `Set*`, `PumpAuthorize`, `PumpStop`, `PumpEmergencyStop`, `PumpResume`, `PumpSuspend`, `PumpCloseTransaction`, firmware update або save/apply configuration без окремого явного дозволу.
- Не змінювати remote server тестового контролера без окремої команди користувача.
- Перший UI-огляд робити read-only: status, configuration view, reports, logs без збереження змін.
- Усі знайдені висновки фіксувати в `docs/notes/pts2/*` з датою, без збереження сторонніх параметрів підключення.