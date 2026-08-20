# @nextmoe/edit-ui-core

Framework-free core of the NextMoe edit-ui family: the wire/schema types of the
schema-driven edit surface, plus the pure helpers the Vue layer renders with.

No Vue, no DOM framework — `diff` is the only runtime dependency, so a server or a
CLI can import the same diff and formatting logic the UI uses.

```bash
pnpm add @nextmoe/edit-ui-core
```

## What is in here

**Types** — `EditSchemaField`, `EditControl`, `EditSelectOption`,
`EditObjectColumn`, `EditContextItem`, `EditFieldConfig`, `EditFieldConfigMap`,
`EditProposal`, `EditAmendment`, `EditRevision`, `EditUser`, `ImageDiffEntry`.

**Value helpers** — `stableStringify`, `editValueEqual`, `cloneEditValue`,
`formatEditValue`, `formatEditItem`, `diffItems`.

**Control resolution** — `resolveControl(field, config)` picks the control for a
schema field; `EDIT_CONTROLS` is the list of controls this version knows and
`isEditControl(value)` is the forward-compatibility guard the Vue layer uses to
degrade an unknown control to a read-only display.

**Text diff** — `diffTextSegments`, `diffTextStats`, `isTextDiffElidable`,
`elideTextDiff`, `TEXT_DIFF_ELIDE_OVER`. CJK is segmented on word boundaries via
`Intl.Segmenter` when the runtime has it.

**Badges** — `proposalStatusBadge`, `revisionActionBadge`.

## The generic component slot

`EditFieldConfig` carries a `component?` escape hatch for a site-supplied custom
field renderer. That is a Vue component — but typing it as one would put `vue` in
this package's dependency closure, which is exactly what this package must not
have. So the type is generic (`EditFieldConfig<TComponent = unknown>`) and
`@nextmoe/edit-ui-vue` re-exports the specialisation `EditFieldConfig<Component>`.
Use the vue package's type in a Vue app.

## License

AGPL-3.0-only.
