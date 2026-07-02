# Міграції БД

Prisma schema живе у `db/prisma/schema.prisma`. Для локального старту:

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

MVP використовує PostgreSQL. Сирі jsonPTS пакети зберігаються перед нормалізацією, щоб мати аудит, replay і debug для PTS-2.
