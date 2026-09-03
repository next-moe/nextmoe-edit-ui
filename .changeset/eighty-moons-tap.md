---
'@nextmoe/edit-ui-core': minor
'@nextmoe/edit-ui-vue': minor
---

Editable per-image metadata. `EditFieldConfig.itemColumns` describes the
attributes one image carries — the catalog's covers are
`{image_hash, kind, portrait_pinned, sexual, violence}` and its screenshots
`{image_hash, caption, sexual, violence}`, none of which had any UI — and the
image field gains a per-item editor plus badges on the tile so a set flag is
visible without opening anything. `summarizeColumns` renders a column set as
short labels for that badge row.
