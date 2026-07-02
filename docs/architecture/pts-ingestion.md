# PTS-2 Ingestion

## Базовий принцип

PTS-2 може сам підключатися до remote server і надсилати jsonPTS packets через HTTP/HTTPS POST. MVP починає з automatic upload; user-initiated read requests із вебкабінету проєктуються як окремий flow.

## Режим 1: automatic upload

Контролер періодично надсилає події та стани на EZ MONITOR:

- `UploadPumpTransaction`
- `UploadTankMeasurement`
- `UploadInTankDelivery`
- `UploadAlertRecord`
- `UploadPayment`
- `UploadShift`
- `UploadConfiguration`
- `UploadStatus`
- `RequestTagsInformation`

Server response завжди повертає jsonPTS confirmation з тим самим packet `Id` або `TagsInformation` для card/tag flow.

## Режим 2: user-initiated read requests

Користувач у кабінеті відкриває сторінку ПРК, резервуарів, логів, діагностики або натискає refresh. Backend ініціює read-only jsonPTS запит до конкретного PTS-2, перевіряє RBAC/station scope, пише audit і повертає актуальний snapshot у UI.

Перші read-only кандидати:

- `PumpGetStatus`
- `PumpGetTotals`
- `PumpGetPrices`
- `PumpGetTag`
- `ProbeGetMeasurements`
- `ReaderGetStatus`
- `ReportGetPumpTransactions`
- `ReportGetTankMeasurements`
- `ReportGetInTankDeliveries`
- `ReportGetAlertRecords`
- `GetUploadedRecordsInformation`
- `GetRemoteServerLoggingConfiguration`

Remote pump control не входить у MVP.

## Endpoint-и automatic upload

- `POST /pts/jsonPTS`
- `POST /jsonPTS`
- `POST /api/v1/jsonPTS`
- `POST /pts/:uri`

## Auth і integrity

1. Визначити controller через `X-Pts-Id`, `PtsId` або конфігурацію endpoint.
2. Basic auth на старті MVP.
3. Якщо для controller заданий `SecretKey`, перевірити `X-Data-Signature` як HMAC SHA-256 по raw body.
4. Відхиляти невідомі PTS identity, якщо endpoint переведено з demo mode у strict mode.

## Confirmation

Відповідь має бути jsonPTS envelope з тим самим packet `Id`. Для upload packet повертається confirmation/status без виконання небезпечних команд. Дублікати повертають успішне підтвердження без повторної нормалізації.