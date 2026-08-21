# edit-ui demo + docs site

The public site at **https://edit-ui.nextmoe.dev** — a live demo of every
control and view, plus the integration guide. Private (never published to npm),
deployed as a container.

```bash
pnpm --filter @nextmoe/edit-ui-playground dev     # http://localhost:6898
pnpm --filter @nextmoe/edit-ui-playground build   # .output/server/index.mjs
```

## What is on it

- `/` — the landing page: a full-configuration `SchemaForm` (every
  `EditControl`, both layouts, the `disabled` review mode), a three-field
  minimal one, the four `FieldDiff` hints, and the review queue + revision
  timeline. Data comes from `app/fixtures.ts`; the injected functions
  (`uploadImage`, `resolveImage`, `searchEntities`, `resolveEntities`) are local
  fakes and images are inline SVG data URIs, so the page needs no network.
- `/guide` — install, the two consumption paths, the Tailwind `@source` line,
  the schema/config contract.

`holo_intensity` in the fixture carries a deliberately unknown control; it is
there to show the read-only degradation.

## How it consumes the packages

Exactly the way a real site does: KunUI chrome from the `@kungal/ui-nuxt` layer,
the edit components through this repo's own Nuxt module — so every build
exercises the module's auto-import path and every deploy proves the guide.

The one deliberate difference from a consuming app is the Tailwind scan in
`app/assets/css/main.css`: it points at `packages/vue/src` because `nuxt dev`
runs here with no dist built, while a consumer scans
`node_modules/@nextmoe/edit-ui-vue/dist`. Both work; the guide documents the
consumer form.

## Deployment

`docker/docs.Dockerfile` builds the workspace packages and then this app into a
Nitro node-server image on port **6760**;
`.github/workflows/docs-image.yml` pushes it to
`ghcr.io/next-moe/nextmoe-edit-ui-docs`; `docker-compose.prod.yml` at the repo
root is what Dokploy runs.
