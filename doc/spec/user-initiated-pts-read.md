# Spec Draft: User-initiated PTS Read Requests

## Ціль

Дати користувачу в кабінеті можливість отримувати актуальний стан ПРК, резервуарів, логів або діагностики не лише через periodic uploads, а й за запитом із UI.

## Out of scope

- Remote pump control.
- Зміна конфігурації PTS-2.
- Firmware update.

## Safety

Кожен запит має мати tenant/station scope, permission check, audit log і timeout/retry policy.
