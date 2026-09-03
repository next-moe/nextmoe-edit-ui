---
'@nextmoe/edit-ui-core': minor
'@nextmoe/edit-ui-vue': minor
---

First-class suppression. A row in a multi-source list can be hidden with a
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
