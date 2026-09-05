---
'@nextmoe/edit-ui-core': minor
'@nextmoe/edit-ui-vue': minor
---

Consume the spec 2.8.0 value shapes. The edit API's schema has two faces — the
actor-caps face knows what you may change, `GET /v2/catalog/schemas/{object}`
knows what a value looks like — and `mergeSchemaFaces` joins them onto
`EditSchemaField`, which gains `vocabulary`, `encoding`, `base`, `nullable` and
`element`. `SchemaForm`/`SchemaField` accept a `vocabularies` map (the
`GET /v2/vocabularies` answer): an enum field whose config declares no options
derives them from its vocabulary, `encoding: 'int'` as base plus the token's
published-order index and `encoding: 'token'` as the token itself, instead of
degrading to read-only. A vocabulary field that arrives without an encoding —
the caps face alone, or a server below spec 2.8.0 — stays read-only rather than
guessing itself into a 422. The schema's `nullable` now also reaches the field
buffer when the config is silent.

`parseEditProblem` translates the reason codes whose detail adds nothing beyond
the key (`IMMUTABLE`, `NOT_PERMITTED`, `INCONSISTENT_WITH`) into Chinese;
validation reasons keep the server's specific prose.
