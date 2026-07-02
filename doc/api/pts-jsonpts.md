# PTS jsonPTS API

## Automatic upload endpoints

- `POST /pts/jsonPTS`
- `POST /jsonPTS`
- `POST /api/v1/jsonPTS`
- `POST /pts/:uri`

## Confirmation rule

Відповідь повертає jsonPTS envelope з тим самим packet `Id`. Дублікати мають бути ідемпотентними.

## User-initiated read requests

Окремий backend flow для read-only команд, які запускає користувач із кабінету. Цей flow не дорівнює remote pump control і має мати RBAC, audit і safety policy.
