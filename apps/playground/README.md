# edit-ui playground

Private Nuxt app (never published). One page, driven by a fixture schema, that
renders every `EditControl` plus `FieldDiff` / `ProposalCard` / `ReviewQueue` /
`RevisionTimeline` — the visual check while developing the packages.

```bash
pnpm --filter @nextmoe/edit-ui-playground dev   # http://localhost:6898
```

It consumes the packages the way a real site does: KunUI chrome from the
`@kungal/ui-nuxt` layer, the edit components through this repo's own Nuxt module,
so every build exercises the module's auto-import path. The injected functions
(`uploadImage`, `resolveImage`, `searchEntities`, `resolveEntities`) are local
fakes in `app/fixtures.ts` — images are inline SVG data URIs, so the page needs no
network.

`holo_intensity` in the fixture carries a deliberately unknown control; it is
there to show the read-only degradation.
