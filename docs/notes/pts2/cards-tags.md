# Cards And Tags

## MVP card authorization

1. PTS-2 читає tag/card і надсилає `RequestTagsInformation`.
2. API шукає `cards.tag` у межах organization/station.
3. API перевіряє:
   - `status = ACTIVE`;
   - дозволені fuel grade codes;
   - account type;
   - баланс/ліміти;
   - station scope/policy, якщо буде налаштовано.
4. API повертає `TagsInformation` з дозволом або відмовою.
5. Після `UploadPumpTransaction` API створює `card_ledger` запис і фіксує використання.

## Відмови

- Unknown tag -> denied, reason `unknown_tag`.
- Blocked/expired -> denied, reason `card_not_active`.
- Недостатній баланс або перевищений ліміт -> denied, reason `limit_exceeded`.
- Заборонений вид пального -> denied, reason `fuel_grade_not_allowed`.

## Важливо

MVP не має дозволяти небезпечні remote-control дії лише на основі card flow. Авторизація тегів - окремий безпечний сценарій.
