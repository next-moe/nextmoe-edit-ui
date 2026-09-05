---
'@nextmoe/edit-ui-core': minor
'@nextmoe/edit-ui-vue': minor
---

Consume the spec 2.6.0 value shapes. The edit API's schema has two faces — the
actor-caps face knows what you may change, `GET /v2/catalog/schemas/{object}`
knows what a value looks like — and `mergeSchemaFaces` joins them onto
`EditSchemaField`, which gains `vocabulary`, `base`, `nullable` and `element`.
`SchemaForm`/`SchemaField` accept a `vocabularies` map (the
`GET /v2/vocabularies` answer): an enum field whose config declares no options
derives them from its vocabulary — integer-coded fields as base plus the
token's published-order index — instead of degrading to read-only. The coding
of a scalar enum is not declared on the wire, so it is inferred from the stored
value (a positive base also proves integer coding); a field whose coding cannot
be decided stays read-only rather than guessing itself into a 422. The schema's
`nullable` now also reaches the field buffer when the config is silent.

`parseEditProblem` translates the reason codes whose detail adds nothing beyond
the key (`IMMUTABLE`, `NOT_PERMITTED`, `INCONSISTENT_WITH`) into Chinese;
validation reasons keep the server's specific prose.
