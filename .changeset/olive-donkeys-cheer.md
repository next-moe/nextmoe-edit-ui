---
'@nextmoe/edit-ui-core': minor
---

An `enum` field with no configured options resolves to `readonly` rather than a
free-text input. The vocabulary lives on the server, so a text box invites a
value it will reject — `content_rating` wants an integer and `display_nsfw` a
boolean, and both used to render as an empty text field.
