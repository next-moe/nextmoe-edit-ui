# @nextmoe/edit-ui-catalog

## 0.3.1

### Patch Changes

- Updated dependencies [0296fe2]
  - @nextmoe/edit-ui-core@0.4.0

## 0.3.0

### Minor Changes

- 0e91a50: Pick roles, engines and series by name. `CatalogEntityRef` gains `role`
  (resolved against `GET /v2/catalog/roles`, which text search does not cover),
  `engine` and `series` (both in `searchObjects` since spec 2.5.0): a credit's
  职责 column becomes an entity picker when the site injects a role search, and
  `engine_ids`/`series_ids` become multi entity pickers, each falling back to the
  old id input when no search is injected. `RELEASE_PLATFORM_OPTIONS` now follows
  the published vocabulary order (`wiu` before `win`), and a census-driven suite
  asserts every option table against the engine's published vocabularies — wire
  codes as base plus published-order index, token tables in published order.
- 74ca7c2: New package: field presets for the NextMoe catalog editing API. A tested
  `EditFieldConfig` table covering all fifty keys the editing engine registers —
  labels, groups, enum vocabularies as the integers the engine demands, object-list
  columns with their JSON types, per-image attribute columns, and the identity-key
  builders for the four suppressible lists.

  ```ts
  import { catalogConfig } from "@nextmoe/edit-ui-catalog";
  const config = catalogConfig("catalog.work", { searchEntities, uploadImage });
  ```

  It is configuration, not a client: nothing here calls an API. It exists because
  the schema endpoint reports key/kind/diff_hint/caps and never an element shape,
  an enum vocabulary or nullability, so without it every site rediscovers all fifty
  fields and gets a 422 for each one it guesses wrong. The completeness suite drives
  its loops from `schema/inventory.json`, a census of the engine's own field specs,
  so a field the engine adds fails the suite rather than silently having no preset.

### Patch Changes

- 827882f: A work title with no language now gets an identity key, so its suppression
  toggle appears at all. The row that reaches `identityKey` has had every blank
  optional key dropped for the wire payload, but the column is `NOT NULL` and
  stores `""`, so the key keeps an empty segment — rejecting the missing `lang`
  left exactly the alias rows unsuppressible. A suppressed row also carries a
  「已隐藏」chip: dimming alone did not say why the row was inert.
- Updated dependencies [a00f6db]
- Updated dependencies [f04d871]
- Updated dependencies [215db8c]
- Updated dependencies [88c6d8c]
- Updated dependencies [923d2e2]
- Updated dependencies [0af038f]
  - @nextmoe/edit-ui-core@0.3.0
