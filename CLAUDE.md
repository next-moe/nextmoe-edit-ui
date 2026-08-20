# Project Guidelines — nextmoe-edit-ui

`AGENTS.md` is the same file; keep the two in sync.

## Iron rules (non-negotiable)

1. **No gradient backgrounds, ever.** No `bg-gradient-*`, no `from-*/via-*/to-*`,
   no `linear-gradient()` / `radial-gradient()` / `conic-gradient()`. Solid
   colours from the KunUI semantic palette only.
2. **KunUI-first — compose `@kungal/ui-vue`, never fork or modify it.** Reach for
   a `Kun*` component before hand-rolling anything. KunUI is a shared upstream
   library: if it has a bug or a missing feature, report it, do not vendor a
   patched copy here.
3. **These packages ship no CSS and no colour of their own.** Classes are KunUI
   semantic tokens (`text-default-500`, `bg-content1`, `border-default-200`,
   `text-danger-600` …), which already adapt to light/dark — never `dark:`
   prefixes, never raw Tailwind palette colours (`gray`, `indigo`, `blue`…).

## Engineering

- Commit messages in **English**.
- **Arrow functions everywhere** in TS/Vue. No `function` declarations.
- Merge class names with `cn` (from `@kungal/ui-core`) wherever practical.
- Keep files under ~300 lines where practical.
- `@nextmoe/edit-ui-core` must stay framework-free: **no `vue` in its dependency
  closure**, not even a type-only import. The Vue-shaped parts of the type family
  are generic slots that `@nextmoe/edit-ui-vue` specialises.
- The components take **no backend knowledge**. Anything that would call an API is
  an injected function on `EditFieldConfig` (`uploadImage`, `resolveImage`,
  `searchEntities`, `resolveEntities`) supplied by the consuming site.
- Unknown `control` / `kind` values must degrade to a read-only display and never
  throw. Adding a control means adding it to `EDIT_CONTROLS` in the core package;
  the `EditControl` union is derived from that array so the two cannot drift.
- A new component in `@nextmoe/edit-ui-vue` must be added to
  `EDIT_UI_COMPONENT_NAMES`, or the Nuxt module will not register it.

## Comments

**Default: none.** Code that reads clearly gets no comment.

A comment is earned by a mistake that already happened — an agent or a person got
it wrong, a review caught it, a test went red. Write the wrong conclusion that was
actually reached, not a restatement of the code. Two standing exceptions, where
the comment is a record rather than a warning:

- a constraint that is true but invisible from this file (a version floor, an
  upstream bug, a required ordering);
- a completeness assertion over a hand-maintained list.

Never write: restatements, section banners, `TODO` without an owner, or doc
comments that only echo the identifier. English, and short.

Machine-semantic directives (`@ts-expect-error`, `eslint-disable`,
`prettier-ignore`, `// Code generated … DO NOT EDIT`) are not comments and are
never removed.

## Layout

```
packages/core      @nextmoe/edit-ui-core   framework-free TS (tsup → esm + cjs + d.ts)
packages/vue       @nextmoe/edit-ui-vue    .vue components (vite lib + vue-tsc d.ts)
packages/nuxt      @nextmoe/edit-ui-nuxt   Nuxt module, raw TS, no build step
apps/playground    private Nuxt app, fixture-schema driven
```

Root scripts run over the workspace: `pnpm build` / `typecheck` / `test` / `clean`.
Package manager is pinned (`packageManager` field); use pnpm, not npm or yarn.

## Provenance

These components were extracted from kun-galgame-forum's `editkit` family
(`apps/web/app/components/editkit/`) at commit `f099ad0b`. Behaviour is
deliberately preserved; when in doubt about an odd-looking construct, it is
probably load-bearing there.
