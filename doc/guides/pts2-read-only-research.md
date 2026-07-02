# Read-only дослідження PTS-2

## Правила

- Не виконувати `Set*`, `PumpAuthorize`, `PumpStop`, `PumpEmergencyStop`, `PumpResume`, `PumpSuspend`, `PumpCloseTransaction` без окремого явного дозволу.
- Не змінювати remote server configuration тестового контролера.
- Не зберігати credentials у repo.
- Findings записувати в `doc/notes/pts2/` без сторонніх параметрів підключення.

## Що можна читати

- Сторінки UI та назви розділів.
- Firmware/device information.
- Uploaded records counters.
- Packet names і read-only builders із локального UI JS.
