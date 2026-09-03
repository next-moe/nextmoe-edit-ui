# @nextmoe/edit-ui-catalog

Field presets for the NextMoe catalog editing API.

`@nextmoe/edit-ui-vue` renders whatever schema it is handed, and deliberately
knows nothing about any particular backend. That leaves every site to rediscover,
for all fifty registered field keys, which control to use, which enum values the
server accepts as integers, and what shape one element of a list actually is —
none of which the schema endpoint reports.

This package is that answer, written once and tested against a census of the
engine's own field specs (`schema/inventory.json`). It is still only
configuration: nothing here calls an API. The site supplies `uploadImage`,
`resolveImage`, `searchEntities` and `resolveEntities`.

```ts
import { catalogConfig } from '@nextmoe/edit-ui-catalog'

const config = catalogConfig('catalog.work', {
  searchEntities: { character: searchCharacters, tag: searchTags },
  uploadImage
})
```

## Provenance

`schema/inventory.json` and `schema/inventory-report.md` are a census of
`nextmoe-infra`'s `apps/api/internal/platform/catalog/editspec/` at
`w161-hotfix` / `3454161d`. They are not published to npm; they exist so the
completeness tests can assert that no registered field is missing a preset, and
so a future engine change can be diffed against what this table was built from.
