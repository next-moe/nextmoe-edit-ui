---
'@nextmoe/edit-ui-core': minor
'@nextmoe/edit-ui-vue': minor
---

Stop scalar list editors from destroying object-shaped list fields, and send the
JSON types the catalog editing engine actually demands.

- `guardEditControl` downgrades `string-list` / `number-list` to a read-only view
  when the value holds objects. The wire schema says `list` + `items` for both
  `["https://…"]` and `[{lang, title, latin, kind}]`, so no static mapping can
  tell them apart; the previous default stringified rows to `"[object Object]"`
  and emitted that back as the field's new value.
- `EditObjectColumn` gains `type` (`string` | `integer` | `number` | `boolean`),
  `required`, and entity-picker columns. `buildEditRow` / `buildEditRows` coerce
  each column to its declared JSON type and drop every key the columns do not
  declare, so a row survives the engine's `asObject` and `objInt` checks.
- `EditSchemaField` gains `max_elements` and `max_suppressed`; list editors show
  the count and stop at the cap instead of failing on the server.
- `SchemaField` / `SchemaForm` accept `errors` and render field-level messages,
  including the row issues the object-list editor reports.
- `resolveControl` infers `object-list` from configured `columns` and
  `entity-picker` from a configured `searchEntities`.
