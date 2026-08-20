# @nextmoe/edit-ui

The schema-driven **edit** component family of the NextMoe ecosystem — the form
that renders an entity's editable fields from a server-sent schema, the per-field
controls, and the diff / proposal / revision views that go with them.

Third family alongside [KunUI](https://github.com/kungal/kun-ui) (`@kungal/ui-*`)
and [KunEditor](https://github.com/kungal/kun-editor) (`@kungal/editor-*`). It
**composes** KunUI — it does not fork, wrap or re-style it.

| Package                  | What it is                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `@nextmoe/edit-ui-core`  | Framework-free TypeScript: the wire/schema types + the pure diff, formatting and badge helpers. No Vue anywhere in its dependency closure. |
| `@nextmoe/edit-ui-vue`   | The Vue 3 components. Peer deps: `vue ^3.5`, `@kungal/ui-vue ^2`.                              |
| `@nextmoe/edit-ui-nuxt`  | A Nuxt module that auto-imports the components under a configurable prefix (default `Edit`).   |

`apps/playground` is a private Nuxt app that renders every control and view off a
fixture schema — the visual check while developing.

## Two ways to consume it

### 1. Nuxt module (no imports in templates)

```bash
pnpm add @nextmoe/edit-ui-nuxt @nextmoe/edit-ui-vue @nextmoe/edit-ui-core
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@kungal/ui-nuxt'],
  modules: ['@nextmoe/edit-ui-nuxt'],
  editUi: { prefix: 'Edit' } // default; `global: true` also available
})
```

```vue
<EditSchemaForm :fields="fields" :values="values" :config="config" />
```

The prefix is why the module exists: a site migrating off a local copy of these
components can keep its own tag names (`prefix: 'Editkit'` → `<EditkitSchemaForm>`)
and change zero templates.

### 2. Direct Vue import (any Vue 3 app)

```ts
import { SchemaForm, FieldDiff } from '@nextmoe/edit-ui-vue'
import type { EditFieldConfigMap } from '@nextmoe/edit-ui-vue'
```

Components are exported under their bare names; the prefix is applied only by the
Nuxt module.

### Styling

The packages ship **no CSS**. Every class is a KunUI semantic token
(`text-default-500`, `bg-content1`, `border-default-200`, `text-danger-600` …), so
the host app needs KunUI's Tailwind entry and must include this package in its
Tailwind `@source` scan:

```css
@import 'tailwindcss';
@import '@kungal/ui-tokens';
@import '@kungal/ui-vue/style.css';
@source '../../node_modules/@kungal/ui-vue';
@source '../../node_modules/@nextmoe/edit-ui-vue';
```

No gradient backgrounds are used anywhere, and none may be added.

## The injection-function boundary

These components know how to *render* an edit surface. They know nothing about
your API, your image host, or your entity catalogue. Everything that touches a
backend is a function the **site** provides through `EditFieldConfig`:

| Field config key  | Signature                                              | The site's job                                        |
| ----------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `uploadImage`     | `(file, currentItems) => Promise<item \| null>`         | Upload a picture, return the item to store. Absent ⇒ the image field renders read-only. |
| `resolveImage`    | `(value) => string`                                     | Turn a stored image value into a displayable URL.     |
| `searchEntities`  | `(keyword) => Promise<EditSelectOption[]>`              | Search the entity catalogue for the pickers.          |
| `resolveEntities` | `(ids) => EditSelectOption[] \| Promise<...>`           | Turn already-stored ids back into labels.             |

There is no default, no fallback fetch and no built-in endpoint. A picker with no
`searchEntities` simply does not render as a picker.

## Forward compatibility: unknown controls degrade, never throw

The edit engine may start sending a `control` (or a schema `kind`) that an
installed package predates. `SchemaField` renders such a field as a **read-only
text / JSON display** instead of throwing or falling through to a text input that
would invite an unsaveable edit. `isEditControl()` from the core package is the
check; `EDIT_CONTROLS` is the list it is derived from.

This is a contract, pinned by `packages/vue/src/SchemaField.spec.ts`: an old
package in production must not break when the engine ships a new render hint.

## Development

```bash
pnpm install
pnpm build       # core (tsup) → vue (vite + vue-tsc d.ts) → nuxt → playground
pnpm typecheck
pnpm test
pnpm --filter @nextmoe/edit-ui-playground dev   # http://localhost:6898
```

Releases go through [changesets](https://github.com/changesets/changesets):
`pnpm changeset`, then `pnpm ci:version` / `pnpm ci:publish`. The three published
packages are versioned in lockstep.

## Provenance

Extracted from the `editkit` component family of
[kun-galgame-forum](https://github.com/KunMoe/kun-galgame-forum)
(`apps/web/app/components/editkit/`) at commit
`f099ad0b5dfb20c71716332b6c3e4c459d59e41e`, behaviour-preserving.

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).
