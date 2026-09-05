---
'@nextmoe/edit-ui-catalog': minor
---

Pick roles, engines and series by name. `CatalogEntityRef` gains `role`
(resolved against `GET /v2/catalog/roles`, which text search does not cover),
`engine` and `series` (both in `searchObjects` since spec 2.5.0): a credit's
职责 column becomes an entity picker when the site injects a role search, and
`engine_ids`/`series_ids` become multi entity pickers, each falling back to the
old id input when no search is injected. `RELEASE_PLATFORM_OPTIONS` now follows
the published vocabulary order (`wiu` before `win`), and a census-driven suite
asserts every option table against the engine's published vocabularies — wire
codes as base plus published-order index, token tables in published order.
