# Дослідження UI PTS-2

Дата дослідження: 2026-07-02  
Джерело: тестовий PTS-2 controller `http://192.168.1.116/` у локальній мережі.  
Метод: локальний Playwright + системний Chrome, Basic auth через env-змінні.  
Безпека: дії, що змінюють стан, не натискались; скріншоти й manifests замасковані для IP/MAC/device ID та значень у полях вводу.

## Короткий висновок

PTS-2 UI - це технічна консоль пристрою, а не мережевий SaaS-кабінет, тому копіювати її візуально не треба. Найцінніші концепції для EZ MONITOR: live-картки ПРК, tank gauges з ризиками, health/diagnostics панелі, tabbed reporting і явна карта конфігураційних сутностей. UI контролера часто змішує read-only моніторинг і небезпечні write/control дії на одному екрані, тому в EZ MONITOR треба жорстко розділити monitoring, configuration і control. Сторінка remote server configuration підтверджує корисну модель: окремі upload-типи, HTTP/WebSocket режими, `RequestTagsInformation`, status/ping-періоди та secret key. Сторінка users показує базові permission groups, які можна використати як input для RBAC, але в нашому продукті вони мають бути розширені tenant/station scopes. Найсильніший UI-сигнал для MVP - station detail як робочий operational surface: ПРК, резервуари, alerts, останні транзакції, health і read-only refresh.

## Карта джерел

- `manifest.json` - основні сторінки: home, actions menu, device information, configuration, prices, pumps, tanks, reports, logging, diagnostics, firmware.
- `interaction-manifest.json` - внутрішні вкладки configuration/reporting і режими pumps table/counters.
- `screenshots/` - 31 sanitized screenshot зі станами UI.
- Публічні web-джерела в цьому research pass не сканувались; фокус був на авторизованому UI реального тестового контролера.

## Ключові скріншоти

| Поверхня | Скріншот |
| --- | --- |
| Home | `screenshots/01-home.png` |
| Actions / shift menu | `screenshots/02-actions-menu.png` |
| Device information | `screenshots/03-device-information.png` |
| Configuration / general | `screenshots/04-configuration.png` |
| Configuration / remote server | `screenshots/22-configuration-server.png` |
| Configuration / users | `screenshots/23-configuration-users.png` |
| Pumps / widgets | `screenshots/06-pumps-control.png` |
| Pumps / table controls | `screenshots/24-pumps-control-table.png` |
| Pumps / counters | `screenshots/25-pumps-control-counters.png` |
| Tanks monitoring | `screenshots/07-tanks-monitoring.png` |
| Reporting / pumps | `screenshots/08-reporting.png` |
| Reporting / alerts | `screenshots/29-reporting-alerts.png` |
| Logging | `screenshots/09-logging.png` |
| Self diagnostics | `screenshots/10-self-diagnostics.png` |
| Firmware update | `screenshots/11-firmware-update.png` |

## Спостережена структура UI

- Основна навігація використовує лівий icon-only sidebar із hover tooltips: device info, configuration, prices, pumps, tanks, reporting, logging, diagnostics, firmware.
- Верхня панель показує firmware version, logged-in user, online indicator і `Actions` dropdown.
- `Actions` dropdown exposes shift state, shift number, shift user/time, `Close`, `Set closing`, `Logout`.
- `Device information` combines firmware/device identifier, supported protocol catalogs, battery, CPU, SD flash, GPS and system operation cards.
- `Configuration` is a tabbed admin console: settings, pumps, probes, grades, payments, tanks, nozzles, boards, readers, parameters, wireless, server, users.
- `Remote server` tab exposes upload categories for pump transactions, tank measurements, deliveries, GPS, alerts, payments, shifts, configuration, status and tags information.
- `Pumps control` has three modes: widget cards, table controls and counters/export table.
- `Tanks monitoring` uses large tank cards with percentage gauge, product/water/temperature/density/mass fields, delivery icon and alarm marker.
- `Reporting` is tabbed by domain: pumps, tanks, reconciliation, GPS, alerts, payments, report files.
- `Self diagnostics` is service-oriented: RS-485/RS-232 matrices plus health state cards for SD flash, clock, battery, CPU and DIP switches.

## Пріоритетні UX-висновки

1. Monitoring and control are too close together.
   Доказ: `Pumps control / Table` містить live status разом із `Authorize`, `Stop`, `Resume`, `Suspend`, `Set prices`, `Emergency stop`.
   Рішення для EZ MONITOR: у MVP залишити live monitoring read-only. Будь-який майбутній control має бути окремим route з RBAC, підтвердженням, аудитом, safety state і явним наміром оператора.

2. Tank cards are the strongest reusable operational pattern.
   Доказ: `Tanks monitoring` показує fuel name, fill percentage, product volume, ullage, water, temperature, density, mass і alarm/delivery markers в одній картці.
   Рішення для EZ MONITOR: station detail має отримати tank inventory section із risk color, capacity, ullage, water, last measurement і last delivery.

3. Pump widgets provide a useful first-screen mental model.
   Доказ: `Pumps control / Widgets` показує pump number, status, current nozzle, amount, volume, price і fuel grade.
   Рішення для EZ MONITOR: station page має мати pump status grid, але без control-кнопок у MVP.

4. Controller health belongs in a service/diagnostics panel.
   Доказ: `Device information` і `Self diagnostics` показують battery, CPU, SD flash, clock, ports і protocol lists.
   Рішення для EZ MONITOR: створити service-facing controller health tab із last status upload, firmware, protocol/config snapshot, diagnostics і raw packet links.

5. Reporting is domain-scoped and filter-driven.
   Доказ: `Reporting` tabs розділяють pumps, tanks, reconciliation, GPS, alerts, payments і report files із date range filters.
   Рішення для EZ MONITOR: MVP reports мають стартувати з domain tabs/filters, але generated report files і upload/delete flows лишаються service-only або out of MVP.

6. RBAC groups in the controller are a useful seed, not the final model.
   Доказ: `Users configuration` використовує permission columns: configuration, control, monitoring, reports, payments, shifts.
   Рішення для EZ MONITOR: мапити це на permissions EZ MONITOR, а потім додати organization/station scope, card-manager, auditor і AI-read analytics permissions.

7. Configuration UI reveals important domain entities.
   Доказ: вкладки pumps, probes, grades, payments, tanks, nozzles, boards, readers, parameters, wireless, server і users.
   Рішення для EZ MONITOR: тримати це як backend domain/config snapshot concepts. У MVP UI показувати тільки controller connection settings і read-only config snapshot, не повне device editing.

## Не копіювати напряму

- Icon-only sidebar без постійних підписів: прийнятно для device console, але слабше для операторів мережі, які керують багатьма станціями.
- Узагальнені `Get` / `Set` buttons неоднозначні для SaaS-користувачів. Краще використовувати дієслова: `Оновити з контролера`, `Зберегти налаштування`, `Переглянути snapshot`.
- Mixed destructive links near downloads: report/files and SD flash areas contain `download/delete`. In EZ MONITOR separate destructive actions into service tools with confirmation.
- Firmware upload, restart, restore, emergency stop and pump control actions are out of MVP.

## Можливості для EZ MONITOR

На цей тиждень:

- Додати в station detail UI-секції для pump grid, tank inventory, alerts і latest transactions у поточному стилі EZ MONITOR.
- Додати placeholder `Controller health` із firmware, last upload, last status, online/offline і diagnostics summary.
- Додати RBAC labels для monitoring, reports, payments/cards, shifts, configuration і service.

На цей квартал:

- Побудувати read-only controller config snapshot views для pumps/nozzles/tanks/readers/server uploads.
- Додати report filters за domain і station scope.
- Додати event subscription model для alarms, tank risks, controller offline, upload failures і card authorization issues.

Потребує глибшого дослідження:

- Real jsonPTS responses behind UI refresh actions.
- Safety model for any future pump authorization/control.
- Mapping between PTS-2 users/permissions and EZ MONITOR multi-tenant users.
- Which report files are useful for server-side import versus only local controller service work.

## Відкриті питання

- Which UI refresh actions call jsonPTS read commands versus local web UI endpoints?
- Should EZ MONITOR display controller-side shift state, or model shifts only from uploaded records?
- Які tank alarm states мають стати first-class alert types у MVP?
- Які PTS-2 remote server status flags мають стати connection health signals у dashboard?
