# @nextmoe/edit-ui-core

## 0.3.0

### Minor Changes

- a00f6db: Turn a rejected patch into field-level messages. `parseEditProblem` reads the
  API's RFC 7807 body into `{ fields, form }` ready for `SchemaForm`'s `errors`
  prop, accepting both JSON-pointer prefixes the server emits (`/patch/<key>` for
  unknown, locked and conflicting fields; a bare `/<key>` for validation failures)
  and falling back to the top-level `detail` for a permission refusal, which comes
  back with an empty `errors` array.

  `EditFieldConfig` also gains `allowAdd` / `allowRemove`: the roster field's apply
  step holds no INSERT and no DELETE, so a row added in the form is refused at
  merge, and the button should not be there.

- f04d871: Editable per-image metadata. `EditFieldConfig.itemColumns` describes the
  attributes one image carries — the catalog's covers are
  `{image_hash, kind, portrait_pinned, sexual, violence}` and its screenshots
  `{image_hash, caption, sexual, violence}`, none of which had any UI — and the
  image field gains a per-item editor plus badges on the tile so a set flag is
  visible without opening anything. `summarizeColumns` renders a column set as
  short labels for that badge row.
- 215db8c: First-class suppression. A row in a multi-source list can be hidden with a
  toggle on the row itself; the `.suppressed` companion field is maintained for
  the user instead of being rendered as a list of identity keys to hand-type.

  - `EditFieldConfig.identityKey` supplies the server's key format for one row,
    and is itself the signal that pairs the companion field — no separate
    `pairsSuppressed` flag needed.
  - `toggleSuppressedKey` / `normalizeSuppressedKeys` keep the set ascending and
    unique, comparing by code point because the server compares UTF-8 bytes and
    JavaScript's default sort disagrees above the BMP.
  - `cleanEditText` ports the server's text canonicalisation so a key built in the
    browser matches the one the server derives.

- 88c6d8c: An `enum` field with no configured options resolves to `readonly` rather than a
  free-text input. The vocabulary lives on the server, so a text box invites a
  value it will reject — `content_rating` wants an integer and `display_nsfw` a
  boolean, and both used to render as an empty text field.
- 923d2e2: Stop scalar list editors from destroying object-shaped list fields, and send the
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

- 0af038f: Consume the spec 2.8.0 value shapes. The edit API's schema has two faces — the
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

## 0.2.0

### Minor Changes

- e3f8f7d: 把 `@kungal/ui-vue` 的 peer 范围从 `^2` 抬到 `^2.26.2`。

  `^2` 一直是虚的：这些组件直接渲染 KunDatePicker、KunTagInput、KunSelect 与
  KunAutocomplete，而其中两个 bug 在 2.26.2 之前会直接咬到下游，且都无法在这一层绕开。

  - **KunDatePicker 的 SSR hydration mismatch**（KunUI 2.25.0 修）。触发器当时是
    `<button>` 套 `<button>`，解析器会把清除按钮拎出去，服务端字符串与解析出的 DOM
    对不上；另外 `new Date('2026-06-14')` 按 UTC 解析再按本地时区格式化，UTC 以西的
    访客整整少一天。schema 里只要有一个 `date` 字段，整页就是
    "Hydration completed but contains mismatches"。此前只能在应用层用 `<ClientOnly>`
    包住整个表单——本仓库的 demo 就是这么绕的，这次一并拆掉了。
  - **输入法组合期的回车被抢走**（KunUI 2.26.2 修）。`EntityPicker` /
    `EntityKindPicker` 用的是 KunAutocomplete：拼音还没上屏时，用来确认候选词的那个
    回车会以 `isComposing: true` 的普通 keydown 送到组件，被当成「选中当前高亮项」。
    下游是中文站点，这是每天都会撞到的路径。

  组件代码没有任何改动，也没有用到 2.26 的新 API——这一版只是把一直存在的版本下限写进
  manifest。装着 2.24 的项目升级 KunUI 即可，`^2.26.2` 仍在 2.x 内。

## 0.1.2

### Patch Changes

- ff7104f: Stop driving SchemaForm tab orientation from `useMediaQuery`. Tabs layout now renders two KunTab copies (horizontal + `md:hidden`, vertical + `hidden md:block`) so SSR and the client produce the same DOM.

## 0.1.1

### Patch Changes

- 622d6a4: Update repository metadata after the GitHub org rename from sssmoe to next-moe.
