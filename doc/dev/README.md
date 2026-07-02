# Dev

Нотатки для локальної розробки, tooling, CI та troubleshooting.

## Базові команди

```bash
pnpm install
pnpm db:generate
pnpm typecheck
pnpm build
pnpm test
pnpm dev
```

## Локальні URL

- Web: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:3000`
- OpenAPI: `http://127.0.0.1:3000/api/v1/openapi.json`

## PTS-2 UI через Playwright

Для дослідження UI контролера використовуємо локальний Playwright із системним Chrome. Не використовуємо in-app browser для LAN-адрес PTS-2 і не піднімаємо локальний proxy.

Змінні доступу задаються тільки в поточній shell-сесії:

```powershell
$env:PTS2_UI_URL='http://192.168.1.116/'
$env:PTS2_UI_USERNAME='<login>'
$env:PTS2_UI_PASSWORD='<password>'
```

Скріншоти й тимчасові артефакти складати в `.local/pts2-playwright/`; ця папка не комітиться. До окремої safety-spec клікати тільки read-only сторінки та дії без зміни стану контролера.
