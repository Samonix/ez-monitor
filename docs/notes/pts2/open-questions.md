# Open Questions

## PTS-2/controller UI

- Які точні поля controller UI вимагає для remote server URL, auth і upload packet types?
- Як controller поводиться при тимчасовій недоступності серверу: retry interval, packet batching, duplicate ids?
- Який формат `X-Data-Signature` у реальній конфігурації клієнта: hex/base64, raw body canonicalization?
- Які credentials і режим доступу можна використати для read-only огляду тестового controller `http://192.168.1.116/`?

## Бізнес правила

- Які ролі потрібні в першому production tenant і чи є station-level managers?
- Чи картки мають бути prepaid, credit або hybrid?
- Як рахувати виручку: по PTS transaction amount, payment records, fiscal source або accounting integration?
- Які alert-и критичні для першої автоматичної розсилки?

## Інтеграції

- Чи потрібні Telegram bots у MVP або лише architecture-ready endpoints?
- Які зовнішні API-клієнти першими будуть підключатися?
- Який deployment target: VPS Docker Compose, Kubernetes, Vercel+managed DB або інший cloud?