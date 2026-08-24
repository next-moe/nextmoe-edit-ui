---
"@nextmoe/edit-ui-core": patch
"@nextmoe/edit-ui-vue": patch
"@nextmoe/edit-ui-nuxt": patch
---

Stop driving SchemaForm tab orientation from `useMediaQuery`. Tabs layout now renders two KunTab copies (horizontal + `md:hidden`, vertical + `hidden md:block`) so SSR and the client produce the same DOM.
