---
'@nextmoe/edit-ui-core': minor
'@nextmoe/edit-ui-vue': minor
---

Give the host a submit gate, and name a row issue the way the header does.

`SchemaForm` emits `update:valid` and exposes `valid` / `invalidFields`
alongside `dirtyCount` / `reset`. It is false while any field holds a value the
engine is certain to refuse — an object row missing a required column, a cell
that will not coerce to its declared JSON type, a list over `max_elements`.
Until now the form rendered the message and the host had no signal at all: the
submit button stayed live, the request went out, and the user got the engine's
`element 0: title must not be empty` back in English instead of the Chinese
message already on screen. The `errors` prop is deliberately not part of it —
those come from the previous submit and are what the user is editing to fix, so
blocking on them would strand the form.

- `ObjectListField` derives its issues instead of assigning them on edit, so a
  value that arrives already invalid reaches the gate before the user touches
  anything; it still emits `update:modelValue` only from a real edit, because
  echoing the rebuilt rows would mark the field dirty on load.
- Group tabs mark a blocked group with a danger dot; the dirty-count badge moves
  to `warning`, matching the "已修改" chip, so danger means blocked and nothing
  else.
- `EditRowIssue` gains `label`, and the message reads `第 1 行 标题：必填` rather
  than naming the wire key under a header that says 标题.
