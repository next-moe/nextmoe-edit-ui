# @nextmoe/edit-ui-nuxt

Nuxt module that auto-imports the `@nextmoe/edit-ui-vue` components, so a Nuxt app
writes `<EditSchemaForm>` with no import.

```bash
pnpm add @nextmoe/edit-ui-nuxt @nextmoe/edit-ui-vue @nextmoe/edit-ui-core
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@kungal/ui-nuxt'],
  modules: ['@nextmoe/edit-ui-nuxt']
})
```

## Options (`editUi`)

| Option   | Default  | Meaning                                                              |
| -------- | -------- | -------------------------------------------------------------------- |
| `prefix` | `'Edit'` | Prefix for every registered tag: `SchemaForm` → `<EditSchemaForm>`.   |
| `global` | `false`  | Register globally instead of lazily (Nuxt's `addComponent` `global`). |

```ts
export default defineNuxtConfig({
  modules: ['@nextmoe/edit-ui-nuxt'],
  editUi: { prefix: 'Editkit' } // <EditkitSchemaForm>, <EditkitFieldDiff>, …
})
```

A configurable prefix is the point of this module: a site that already had these
components under its own tag names can adopt the package with zero template
changes.

The component list is not duplicated here — it is `EDIT_UI_COMPONENT_NAMES` from
`@nextmoe/edit-ui-vue`, so the two can never drift.

The package ships raw TypeScript (Nuxt loads it through jiti) and has no build
step.

## License

AGPL-3.0-only.
