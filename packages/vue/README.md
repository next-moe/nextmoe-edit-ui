# @nextmoe/edit-ui-vue

The Vue 3 layer of the NextMoe edit-ui family — a schema-driven edit form, its
per-field controls, and the diff / proposal / revision views.

Composes [KunUI](https://github.com/kungal/kun-ui) (`@kungal/ui-vue`) and ships no
CSS of its own.

```bash
pnpm add @nextmoe/edit-ui-vue @nextmoe/edit-ui-core
# peers: vue ^3.5, @kungal/ui-vue ^2
```

In a Nuxt app, prefer `@nextmoe/edit-ui-nuxt`, which auto-imports all of these
under a configurable prefix.

## Components

| Export             | What it renders                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| `SchemaForm`       | The whole form: groups → sections (stack or tabs), emits `update:patch`.   |
| `SchemaField`      | One field; picks the control from the schema + config.                     |
| `ObjectListField`  | Repeating rows of typed columns.                                           |
| `ImageField`       | Single or multi image upload, drag-sort, pin flag.                         |
| `EntityPicker`     | Search-and-pick entity references.                                         |
| `EntityKindPicker` | Entity references that also carry a kind.                                  |
| `SourceContext`    | The read-only "this came from upstream" strip under a field.               |
| `FieldDiff`        | One field's before/after, routed by `diff_hint`.                           |
| `TextDiff`         | Word-level text diff with elision of long unchanged runs.                  |
| `ImageDiff`        | Only the pictures that changed, never the whole gallery.                   |
| `ProposalCard`     | One edit proposal.                                                         |
| `ReviewQueue`      | Proposals by status, with an `item` slot.                                  |
| `RevisionTimeline` | Revisions, two-way selection, emits `diff`.                                |
| `Time`             | Minimal relative/absolute timestamp used by the two views above.           |

`EDIT_UI_COMPONENT_NAMES` is the list the Nuxt module iterates; a new component
must be added there too.

## Injected functions

Nothing here talks to a backend. `EditFieldConfig` carries the site's functions:
`uploadImage`, `resolveImage`, `searchEntities`, `resolveEntities`. Omit
`uploadImage` and the image field renders read-only; omit `searchEntities` and the
entity pickers do not render as pickers.

## Unknown controls degrade

`SchemaField` renders an unrecognised `control` as read-only text/JSON rather than
throwing or offering an input the site cannot save. See `SchemaField.spec.ts`.

## Styling

Every class is a KunUI semantic token, so the host app's Tailwind build must scan
this package:

```css
@source '../../node_modules/@nextmoe/edit-ui-vue';
```

## License

AGPL-3.0-only.
