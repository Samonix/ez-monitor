# AGENTS.md - EZ MONITOR

## Мова

Відповіді, плани, документація, коментарі до архітектурних рішень і user-facing артефакти оформлюються українською мовою. Код, ідентифікатори, endpoint-и й protocol literals залишаються англійською.

## Context7

Коли робота стосується бібліотек, framework-ів, SDK, API, CLI або cloud-сервісів, спочатку використати Context7 MCP: `resolve-library-id`, потім `query-docs`.

## Vendor-документи

`doc/vendor/**` - джерело контексту, а не робоча зона. Не змінювати ці файли без прямого запиту.

## Архітектурні нотатки

Значущі висновки про PTS-2, jsonPTS, RBAC, AI-доступ або deployment записувати в `docs/notes/**` або `docs/architecture/adr/**`.

## MVP boundary

MVP: HTTP upload ingestion, live monitoring, reports, alerts, cards/tags. Remote pump control не вмикати до окремої safety-spec і тестування реального controller UI.

## Безпека

Секрети не комітити. PTS packets зберігати raw для аудиту. AI не читає БД напряму; тільки read-only API з RBAC і audit log. Дублікати upload packets обробляти ідемпотентно.