---
'@nextmoe/edit-ui-core': minor
'@nextmoe/edit-ui-vue': minor
---

Turn a rejected patch into field-level messages. `parseEditProblem` reads the
API's RFC 7807 body into `{ fields, form }` ready for `SchemaForm`'s `errors`
prop, accepting both JSON-pointer prefixes the server emits (`/patch/<key>` for
unknown, locked and conflicting fields; a bare `/<key>` for validation failures)
and falling back to the top-level `detail` for a permission refusal, which comes
back with an empty `errors` array.

`EditFieldConfig` also gains `allowAdd` / `allowRemove`: the roster field's apply
step holds no INSERT and no DELETE, so a row added in the form is refused at
merge, and the button should not be there.
