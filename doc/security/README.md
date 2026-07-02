# Security

Безпека EZ MONITOR: secrets, RBAC, HMAC, audit, tenant isolation, AI data access і PTS-2 safety.

## Базові правила

- Secrets не комітити.
- PTS HMAC перевіряти по raw body, якщо controller має `SecretKey`.
- AI не читає БД напряму.
- User-initiated PTS reads логувати в audit.
- Remote pump control заблокований до окремої safety-spec.
