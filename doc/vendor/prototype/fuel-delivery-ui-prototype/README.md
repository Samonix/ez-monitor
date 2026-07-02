# Fuel Delivery UI Prototype

Vue 3 + TypeScript + Vite прототип web-кабінету Fuel Delivery Control на mock-даних.

## Команди

```bash
npm install
npm run dev
```

Після старту відкрий:

```text
http://127.0.0.1:4173/
```

Корисні команди:

```bash
npm run dev
npm run build
npm run preview
```

`npm run build` спочатку запускає `vue-tsc --noEmit`, а вже потім Vite build.

## Google Maps

Для локального запуску карта бере ключ із `.env.local`:

```text
VITE_GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_MAPS_MAP_ID=
```

`.env.local` не комітиться. Для репозиторію є тільки `.env.example` без секретів. Якщо ключ відсутній або Google Maps API не завантажився, компонент маршруту автоматично показує mock-схему.

## Live map telemetry

Розділ `Карта` показує тільки рейси `in_transit`. За замовчуванням видно поточні позиції всіх бензовозів у дорозі. Після вибору конкретного бензовоза dropdown-ом або кліком по live-маркеру карта показує тільки його route context.

Маркер бензовоза має вигляд автоцистерни, pulse-анімацію і відкриває telemetry panel із:

- route id;
- TTN;
- номером бензовоза;
- джерелом і timestamp останнього tanker level evidence;
- початковим, поточним і delta volume;
- рівнями по секціях бензовоза.

Детальне правило описано в `doc/ui/live-map-telemetry.md`.

## UI design rule

Прототип використовує operational dashboard pattern:

- спокійний робочий інтерфейс без декоративного шуму;
- collapsible sidebar з outline-іконками `@lucide/vue`;
- видимі controls замість прихованих меню для ключових дій;
- стабільні 44px navigation/action targets;
- адаптивність без горизонтального overflow;
- fallback states для зовнішніх API, зокрема Google Maps;
- browser-перевірка desktop/mobile після UI-змін.

Поточні tokens у `src/styles/main.css`:

- font stack: `Inter, "Segoe UI", Arial, sans-serif`;
- numeric/technical font: `"JetBrains Mono", "SFMono-Regular", Consolas, monospace` with `tabular-nums`;
- scale: `12 / 14 / 16 / 24 / 32 / 48px`;
- primary: clay `#D97757`, slate `#141413`, ivory `#FAF9F5`, oat `#E3DACC`;
- neutral: white `#FFFFFF`, gray-100 `#F0EEE6`, gray-300 `#D1CFC5`, gray-500 `#87867F`, gray-700 `#3D3D3A`;
- semantic: success `#788C5D`, warning `#C78E3F`, danger `#B04A4A`, info `#5C7CA3`;
- spacing: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`;
- radius: `4 / 8 / 12 / 20px`;
- navigation/action target: at least `44px`.

Орієнтир: офіційні Anthropic / Claude design guidelines і HTML design-system reference, зафіксований у `doc/ui/design-system-foundation.md`.

## Що є в прототипі

- список рейсів доставки з фільтрами;
- деталі вибраного рейсу;
- маршрут і точки ризику;
- timeline подій;
- evidence panel з manual та automatic джерелами;
- reconciliation між нафтобазою, бензовозом і АЗС;
- візуалізація секцій бензовоза;
- журнал інцидентів.

## Архітектура

```text
fuel-delivery-ui-prototype
|-- src
|   |-- components
|   |-- composables
|   |-- domain
|   |-- mocks
|   |-- services
|   |-- styles
|   |-- App.vue
|   |-- main.ts
|   `-- vite-env.d.ts
|-- index.html
|-- package.json
|-- tsconfig.app.json
|-- tsconfig.node.json
|-- tsconfig.json
`-- vite.config.ts
```

Mock-дані живуть у `src/mocks`. Спільні типи та розрахунки винесені в `src/domain`. Стан екрана, вибір рейсу та фільтрація винесені в `src/composables`.

Прототип не підключений до MONITOR backend або PTS. Він потрібен для швидкого масштабування й узгодження workflow та UI-підходу перед production implementation.
