---
'@nextmoe/edit-ui-catalog': minor
---

New package: field presets for the NextMoe catalog editing API. A tested
`EditFieldConfig` table covering all fifty keys the editing engine registers —
labels, groups, enum vocabularies as the integers the engine demands, object-list
columns with their JSON types, per-image attribute columns, and the identity-key
builders for the four suppressible lists.

```ts
import { catalogConfig } from '@nextmoe/edit-ui-catalog'
const config = catalogConfig('catalog.work', { searchEntities, uploadImage })
```

It is configuration, not a client: nothing here calls an API. It exists because
the schema endpoint reports key/kind/diff_hint/caps and never an element shape,
an enum vocabulary or nullability, so without it every site rediscovers all fifty
fields and gets a 422 for each one it guesses wrong. The completeness suite drives
its loops from `schema/inventory.json`, a census of the engine's own field specs,
so a field the engine adds fails the suite rather than silently having no preset.
