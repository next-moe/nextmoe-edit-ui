# edit-ui demo + docs site

The public site at **https://edit-ui.nextmoe.dev** — the integration guide plus a
live demo of every control and view. Private (never published to npm), deployed
as a container. Written in **zh-CN**: the downstream consumers are
Chinese-language sites.

```bash
pnpm --filter @nextmoe/edit-ui-playground dev     # http://localhost:6898
pnpm --filter @nextmoe/edit-ui-playground build   # .output/server/index.mjs
```

## Structure

A landing page on the `default` layout, and ten docs pages on the `docs` layout
(sticky header, left nav, right table of contents, prev/next pager):

```
/                    landing
/guide/install       安装
/guide/nuxt          在 Nuxt 中使用
/guide/vue           在 Vue 中使用
/guide/styling       样式与 Tailwind   ← the @source step that silently breaks the UI
/guide/api           Schema 与 Config
/guide/components    组件一览
/demo/form           编辑表单        ← full config + minimal config
/demo/diff           字段差异
/demo/review         审核与历史
```

`app/site.ts` is the single source for the sidebar, and the pager derives from
it — a new page needs a route file and one line there. `/guide` and `/demo`
301-redirect to their first page (`nuxt.config.ts` `routeRules`), because the
packages' READMEs already link to `/guide`.

The right-hand table of contents is read out of the DOM (`app/composables/`),
scanning the `h2[id]` that `SiteSection` renders — so it cannot drift from the
headings.

Data comes from `app/fixtures.ts`; the injected functions (`uploadImage`,
`resolveImage`, `searchEntities`, `resolveEntities`) are local fakes and images
are inline SVG data URIs, so the site needs no network. `holo_intensity` in the
fixture carries a deliberately unknown control; it is there to show the
read-only degradation.

## Writing Chinese copy in a template

A newline inside a run of CJK text becomes a real space when Vue condenses
template whitespace — `控件，\n以及` renders as `控件， 以及`. Keep a Chinese
paragraph (and any `<code>` / `<KunLink>` sitting inside one) on a single line,
however long. Text passed as a prop — `title`, `description`, `lede` — is a JS
string and is not affected.

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
