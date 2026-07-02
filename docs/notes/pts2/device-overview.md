# PTS-2 Device Overview

Дата нотатки: 2026-07-02

PTS-2 forecourt controller - контролер АЗС для інтеграції паливороздавальних колонок, ATG/рівнемірів, price boards, readers, payment/fiscal peripherals і remote monitoring/control сценаріїв.

Ключові можливості для EZ MONITOR:

- Remote server connection: controller може сам підключатися до серверу через HTTP/HTTPS, що знімає вимогу static IP на АЗС.
- jsonPTS protocol: structured JSON envelopes з `Protocol`, `Packets`, `Id`, `Type`, `Data`.
- Upload operational data: транзакції насосів, заміри резервуарів, доставки, alerts, payments, shifts, status, configuration.
- Card/tag integration: controller може запитувати інформацію по тегу через `RequestTagsInformation`.
- Security hooks: Basic/Digest auth і optional `X-Data-Signature` HMAC SHA-256.
- WebSocket support: корисно для майбутнього live-monitoring/control, але MVP стартує з HTTP upload.

Джерела:

- Локальні PDF: `vendor/documents/PTS-2-forecourt-controller-technical-guide.pdf`, `vendor/documents/jsonPTS protocol for PTS-2 controller.pdf`.
- Technotrade PTS-2 page: https://www.technotrade.ua/pts2-forecourt-controller.html
