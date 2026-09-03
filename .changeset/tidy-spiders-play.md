---
'@nextmoe/edit-ui-vue': minor
---

`SchemaForm` no longer lets a filled-in form vanish on a stray navigation. While
the patch is non-empty it holds a `beforeunload` listener (`warnOnLeave`, on by
default, and dropped on unmount), exposes `reset()` for after a successful
submit, and renders a `formErrors` banner for the rejections that name no field —
a permission refusal comes back with an empty `errors` array, so it has nowhere
else to go.

`useUnsavedGuard` is exported for a site that wants the same behaviour around its
own submit button.
