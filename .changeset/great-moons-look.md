---
'@nextmoe/edit-ui-catalog': patch
'@nextmoe/edit-ui-vue': patch
---

A work title with no language now gets an identity key, so its suppression
toggle appears at all. The row that reaches `identityKey` has had every blank
optional key dropped for the wire payload, but the column is `NOT NULL` and
stores `""`, so the key keeps an empty segment — rejecting the missing `lang`
left exactly the alias rows unsuppressible. A suppressed row also carries a
「已隐藏」chip: dimming alone did not say why the row was inert.
