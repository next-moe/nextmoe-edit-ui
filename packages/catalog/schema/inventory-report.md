# Report: catalog editspec inventory

## 1. Inventory summary

50 registered fields across 7 entity types. 4 of them are `.suppressed` companions.

| entity type | field_count | suppression companions |
|---|---|---|
| catalog.character | 17 | 1 (`aliases.suppressed`) |
| catalog.engine | 3 | 0 |
| catalog.label | 3 | 0 |
| catalog.release | 6 | 0 |
| catalog.series | 2 | 0 |
| catalog.tag | 1 | 0 |
| catalog.work | 18 | 3 (`titles.suppressed`, `credits.suppressed`, `roster.suppressed`) |
| **total** | **50** | **4** |

The data is in `inventory.json`.

## 2. Positive control

Every registered key, flat, in the order `inventory.json` stores them:

1. catalog.character.aliases
2. catalog.character.aliases.suppressed
3. catalog.character.birthday_day
4. catalog.character.birthday_month
5. catalog.character.blood_type
6. catalog.character.bust_cm
7. catalog.character.cup
8. catalog.character.description
9. catalog.character.display_name
10. catalog.character.gender
11. catalog.character.height_cm
12. catalog.character.hip_cm
13. catalog.character.intros
14. catalog.character.lang
15. catalog.character.latin
16. catalog.character.waist_cm
17. catalog.character.weight_kg
18. catalog.engine.aliases
19. catalog.engine.intro
20. catalog.engine.name
21. catalog.label.intros
22. catalog.label.links
23. catalog.label.name
24. catalog.release.hidden
25. catalog.release.kind
26. catalog.release.lang
27. catalog.release.platform
28. catalog.release.released
29. catalog.release.title
30. catalog.series.intros
31. catalog.series.name
32. catalog.tag.intros
33. catalog.work.content_rating
34. catalog.work.covers
35. catalog.work.credits
36. catalog.work.credits.suppressed
37. catalog.work.display_name
38. catalog.work.display_nsfw
39. catalog.work.engine_ids
40. catalog.work.intros
41. catalog.work.labels
42. catalog.work.links
43. catalog.work.olang
44. catalog.work.roster
45. catalog.work.roster.suppressed
46. catalog.work.screenshots
47. catalog.work.series_ids
48. catalog.work.tag_ids
49. catalog.work.titles
50. catalog.work.titles.suppressed

Registration is not per-field `editing.Register(...)`. The engine registers an `EntityTypeSpec` whose `Fields` slice is the census. Call graph:

- `editspec.RegisterAll` (`editspec/register.go:16`) calls `RegisterWork`, `RegisterTaxonomy`, `RegisterCharacter`, `RegisterRelease`.
- `RegisterTaxonomy` (`editspec/taxonomy.go:62`) calls `registerLabel`, `registerTag`, `registerEngine`, `registerSeries`.
- Companions are appended with `editing.SuppressedFieldSpec` next to the parent in that same slice (`editspec/work.go:233,281,283`, `editspec/character.go:121`).

Field keys are Go constants. Resolved values:

- `TypeWork` = `"catalog.work"` (`editspec/work.go:16`)
- `TypeCharacter` = `"catalog.character"` (`editspec/character.go:15`)
- `TypeRelease` = `"catalog.release"` (`editspec/release.go:15`)
- `TypeLabel` / `TypeTag` / `TypeEngine` / `TypeSeries` (`editspec/taxonomy.go:17-20`)
- `SuppressedFieldSuffix` = `".suppressed"` (`editing/suppression.go:13`)

Editspec files read in full:

- `register.go`, `work.go`, `work_titles.go`, `work_intros.go`, `work_credits.go`, `work_roster.go`, `work_edges.go`, `work_links.go`, `work_media.go`
- `character.go`, `character_aliases.go`, `character_intros.go`
- `release.go`
- `taxonomy.go`, `taxonomy_intros.go`
- `curated.go`, `identity.go`
- `onmerge.go` (no fields; merge hooks only)
- `submit.go` (claim mint subset of work fields; does not `Register`)

Editspec files not read in full, and why:

- every `*_test.go` in `editspec/` — tests, not registration
- engine files read for the census: `editing/registry.go`, `editing/suppression.go`, `editing/identity.go`, `editing/errors.go`, `editing/mutate.go`, `editing/override.go` (this last is `EditedEntities`, not policy overlays)

No other `editing.Register` of a catalog entity type exists outside tests.

## 3. Error wire shapes  (Part B)

The live HTTP face is v2. Create / amend / merge / revert all funnel through `proposalErr` (`apiv2/handler/me_proposals.go:523`). `catalogErr` (`apiv2/handler/catalog_routes.go:366`) only attaches request identity to an already-built `problem.Problem`; it does not remap editing errors. Fiber writes the Problem as `application/problem+json` (`apiv2/problem/problem.go:184-188`).

Common Problem body (`apiv2/problem/problem.go:24-36`):

```
{
  "type": "https://developer.nextmoe.dev/problems/{domain}/{kebab-code}",
  "title": "<stable English phrase>",
  "status": <http status>,
  "detail": "<request-specific English, or empty>",
  "instance": "<request path+query>",
  "code": "<UPPER_SNAKE>",
  "request_id": "req_<ulid>",
  "errors": [ { "pointer"|"parameter"|"header", "reason", "detail" } ]
}
```

`problem.New` always initialises `errors` to an empty array, never null (`apiv2/problem/problem.go:104`).

### `ValidationError` (`editing/errors.go:33`)

- Mapped at `apiv2/handler/me_proposals.go:573-577`.
- Status **422**, code **`VALIDATION_FAILED`** (`apiv2/problem/registry.go:121`).
- Top-level `detail` is `val.Error()`, i.e. `editing: field "<key>": <reason>` (`editing/errors.go:39`).
- `errors[0].pointer` is `"/" + val.Key` — e.g. `/catalog.work.titles`. That is **not** `/patch/<key>`.
- `errors[0].reason` is always `UNKNOWN_VALUE` (`me_proposals.go:576`), including for length, range, required-ness, and duplicates.
- `errors[0].detail` is again `val.Error()` (the full `editing: field ...` string), not the inner `Reason` alone.
- The field key survives as `errors[].pointer` (wrong prefix for a create-proposal body) and inside both `detail` strings. There is no JSON field named `key` or `reason` holding the inner `ValidationError.Reason`.
- CreateProposal wraps every `Validate` failure as `&ValidationError{Key, Reason: err.Error()}` (`editing/mutate.go:57-58`), so the inner message is the parse helper's `fmt.Errorf` text.

Finding: a POST `/v2/me/proposals` body is `{entity_type, entity_id, patch:{<key>: ...}}`, so the RFC 6901 pointer that actually names the offending value is `/patch/<key>`. ValidationError emits `/<key>`. Amend is `{set, unset}` and would need `/set/<key>`.

### `UnknownFieldError` (`editing/errors.go:21`)

- Mapped at `me_proposals.go:557-561`.
- Status **422**, code **`VALIDATION_FAILED`**.
- Top-level `detail` is `editing: unknown field key "<key>"`.
- `errors[0].pointer` is `"/patch/" + unknownField.Key` (`me_proposals.go:560`).
- `errors[0].reason` is `UNKNOWN_VALUE`.
- The field key survives in `errors[].pointer` under `/patch/` and inside `detail`.

### `LockedFieldError` (`editing/errors.go:27`)

- Mapped at `me_proposals.go:563-567`.
- Status **422**, code **`VALIDATION_FAILED`**.
- Top-level `detail` is `editing: field "<key>" is locked`.
- `errors[0].pointer` is `"/patch/" + lockedField.Key`.
- `errors[0].reason` is `IMMUTABLE` (`apiv2/problem/registry.go:95`).
- The field key survives in `errors[].pointer` under `/patch/` and inside `detail`.

### `PermissionError` (`editing/errors.go:42`)

- Mapped at `me_proposals.go:569-571`.
- Status **403**, code **`PERMISSION_REQUIRED`** (`apiv2/problem/registry.go:134`).
- Top-level `detail` is `editing: not allowed to <action> field "<key>"` (`editing/errors.go:48`). `action` is `"propose"` or `"review"`.
- **`errors` stays the empty array.** No pointer, no structured key, no structured action.
- The field key and the action survive **only** as substrings of `detail`. That is a finding: a client that keys off `errors[].pointer` will not see which field was refused.

### `ConflictError` (`editing/errors.go:51`)

- Mapped at `me_proposals.go:546-555`.
- Status **422**, code **`VALIDATION_FAILED`**.
- Top-level `detail` is `editing: conflicting fields: <k1>, <k2>, ...` (`editing/errors.go:54`).
- One `errors[]` entry per key: `pointer` = `"/patch/" + key`, `reason` = `INCONSISTENT_WITH`, `detail` = `"another revision changed this key since the proposal was written"` (this last string is **not** `ConflictError.Error()`).
- The keys survive in `errors[].pointer` under `/patch/` and in the top-level `detail`. There is no JSON array named `keys`.

### Other editing sentinels that share this mapper (not asked, recorded because they share the function)

- `ErrEmptyPatch` / `ErrEmptyDelta` → 422, pointer `/patch`, reason `REQUIRED` (`me_proposals.go:531-534`).
- `ErrNoEffectiveChanges` → 422, pointer `/patch`, reason `NOT_ALLOWED_VALUE` (`me_proposals.go:535-538`).
- `ErrNotOpen` → 409 `DECISION_ALREADY_MADE`.
- `ErrNotProposer` → 403 `PERMISSION_REQUIRED` with empty `errors`.
- `ErrProposalNotFound` / `ErrRevisionNotFound` / `ErrUnknownEntityType` / `ErrEntityNotFound` → 404 `NOT_FOUND`, detail is `err.Error()`.

An Apply-time error that is **not** one of the five typed errors and **not** those sentinels (for example `fmt.Errorf("editspec: titles: %w", parseErr)` at `editspec/work_titles.go:146`) is returned as a raw `error`. `catalogErr` will not wrap it as a Problem, and `problem.WriteFiberError` will emit **500** `INTERNAL_ERROR` with `detail` equal to `err.Error()` (`apiv2/problem/problem.go:160-170`). The field key is then lost unless it happens to appear in that string.

## 4. Entity lookup endpoints  (Part C)

All of these require an application key unless noted. Display name is always JSON `display_name`. Batch `ids=` is comma-separated, max 100 (`apiv2/handler/collection.go:34`). Search does not accept `ids=` or `cursor=` (`apiv2/handler/catalog_search.go:23-29`). Search `object=` is a closed set: `work, character, credit_name, company, tag` (`apiv2/handler/catalog_search.go:17`).

### `character_id`

| need | exists | method / path | query | display name | registration |
|---|---|---|---|---|---|
| search by text | yes | `GET /v2/catalog/search` | `object=character`, `q=`, `locale=`, `limit=` | `display_name` on `search_result` | `apiv2/handler/catalog_search_routes.go:25` |
| batch resolve | yes | `GET /v2/catalog/characters` | `ids=` | `display_name` | `apiv2/handler/catalog_list_routes.go:110` |
| one id | yes | `GET /v2/catalog/characters/{id}` | | `display_name` | `apiv2/handler/catalog_routes.go:116` |

The collection list has **no** `q=` (`listCatalogCharacters` takes `CollectionInput` only).

### `credit_name_id`

| need | exists | method / path | query | display name | registration |
|---|---|---|---|---|---|
| search by text | yes | `GET /v2/catalog/search` | `object=credit_name`, `q=` | `display_name` | `catalog_search_routes.go:25` |
| search by text (list) | yes | `GET /v2/catalog/credit-names` | `q=` | `display_name` | `catalog_list_routes.go:120` (`listCreditNamesInput.Q` at line 44) |
| batch resolve | yes | `GET /v2/catalog/credit-names` | `ids=` | `display_name` | same |
| one id | yes | `GET /v2/catalog/credit-names/{id}` | | `display_name` | `catalog_routes.go:107` |

### `label_id` (public family name is `company`)

| need | exists | method / path | query | display name | registration |
|---|---|---|---|---|---|
| search by text | yes | `GET /v2/catalog/search` | `object=company`, `q=` | `display_name` | `catalog_search_routes.go:25` |
| batch resolve | yes | `GET /v2/catalog/companies` | `ids=` | `display_name` | `catalog_list_routes.go:60` |
| one id | yes | `GET /v2/catalog/companies/{id}` | | `display_name` | `catalog_routes.go:96` |

The company list has **no** `q=` (`listCompaniesInput` only adds `has_works=`).

### `tag_id`

| need | exists | method / path | query | display name | registration |
|---|---|---|---|---|---|
| search by text | yes | `GET /v2/catalog/search` | `object=tag`, `q=` | `display_name` | `catalog_search_routes.go:25` |
| batch resolve | yes | `GET /v2/catalog/tags` | `ids=` | `display_name` | `catalog_list_routes.go:70` |
| one id | yes | `GET /v2/catalog/tags/{id}` | | `display_name` | `catalog_routes.go:126` |

The tag list has **no** `q=`.

### `engine_id`

| need | exists | method / path | query | display name | registration |
|---|---|---|---|---|---|
| search by text | **no** | `object=engine` is not in `searchObjects`; list has no `q=` | | | `catalog_search.go:17`; `catalog_list_routes.go:90` |
| batch resolve | yes | `GET /v2/catalog/engines` | `ids=` | `display_name` | `catalog_list_routes.go:90` |
| one id | yes | `GET /v2/catalog/engines/{id}` | | `display_name` | `catalog_routes.go:146` |

Finding: no text search.

### `series_id`

| need | exists | method / path | query | display name | registration |
|---|---|---|---|---|---|
| search by text | **no** | not in `searchObjects`; `ListSeries` passes `""` as the name query (`catalog_list.go:158`) | | | `catalog_search.go:17`; `catalog_list_routes.go:80` |
| batch resolve | yes | `GET /v2/catalog/series` | `ids=` | `display_name` | `catalog_list_routes.go:80` |
| one id | yes | `GET /v2/catalog/series/{id}` | | `display_name` | `catalog_routes.go:136` |

Finding: no text search.

### `role_id`

**No v2 endpoint exists** to search roles by text, to list them, or to resolve a batch of ids.

- There is no `/v2/catalog/roles`.
- `searchObjects` does not include `role`.
- `catalog_role` is a seed vocabulary table (`catalog/model/registry.go:23`) with `id`, `key`, `name_cn`/`name_ja`/`name_en`.
- The public credit block publishes `role_key` and `role_name` but **not** `role_id` (`apiv2/repr/work_block.go:45-47`). The same file says the suppression identity `cannot be reconstructed from this object: role_id is not published` (`apiv2/repr/work_block.go:58`).

Finding: the editor needs `role_id` as a JSON integer on `catalog.work.credits`, and the public API does not give the UI a way to look that id up or to search for it.

## 5. Anything that looks wrong — in scope or not

1. `apiv2/handler/me_proposals.go:576` — ValidationError pointer is `"/" + val.Key`. Quoted: `p.Errors = []problem.FieldError{{Pointer: "/" + val.Key, Reason: problem.ReasonUnknownValue, Detail: val.Error()}}`. UnknownField/LockedField/Conflict all use `"/patch/" + key` a few lines above.

2. `apiv2/handler/me_proposals.go:569-571` — PermissionError is returned with no `errors[]`. Quoted: `return problem.New(problem.CodePermissionRequired, "", "", perm.Error())`. The field key is only inside `detail`.

3. `apiv2/handler/me_proposals.go:576` — every ValidationError is tagged `UNKNOWN_VALUE`, including "must be at most 500 characters" and "must not be empty".

4. Public v2 vocabularies are strings (`apiv2/vocab/vocab.go:67-97,121-160`); the editing engine demands the integer codes. Sending `"male"` / `"all_ages"` / `"official"` on a proposal is a 422. Gender is `1,2,3` not `0,1,2` (`catalog/model/constants.go:15-17`).

5. `role_id` has no lookup endpoint. Public credits omit `role_id` (`apiv2/repr/work_block.go:58`): `role_id is not published`.

6. `engine_id` and `series_id` have batch/get but no text search (`apiv2/handler/catalog_search.go:17`: `var searchObjects = []string{"work", "character", "credit_name", "company", "tag"}`).

7. `catalog.work.titles` caps elements at 100 (`editspec/work_titles.go:20`) but `MaxSuppressed` is left 0, so `titles.suppressed` inherits 200 (`editing/suppression.go:47-49`). The companion can hold more keys than the parent can hold rows.

8. `apiv2/handler/catalog_schema.go:42` copies `f.MaxSuppressed` as stored, so GET `/v2/catalog/schemas/work` reports `max_suppressed: 0` on `catalog.work.titles` even though the companion exists and accepts 200.

9. Integer parsers are inconsistent. `parseTitles` kind (`editspec/work_titles.go:71`), `validateContentRating` (`editspec/work.go:313`), `parseNullableI16` (`editspec/character.go:245`), `parseDatePart` (`editspec/release.go:280`), `validateReleaseKind` (`editspec/release.go:174`) accept **only** `float64`. `objInt` (`editspec/curated.go:153`) and `parseIDList` (`editspec/work_edges.go:33`) also accept `int64`. HTTP JSON still arrives as `float64`.

10. Character letmoe overlay sets `automerge: owner` (`editspec/character.go:51-54`) but `OwnerSite` always returns `nil` (`editspec/character.go:78-82`). Quoted: `returning nil is what makes the letmoe overlay's automerge=owner mean "never" for this family.`

11. Existence and upstream-collision checks run in `Apply`, not `Validate` (credits `editspec/work_credits.go:102-107`, roster `editspec/work_roster.go:105`, tags `editspec/work_edges.go:69-78`, labels `editspec/work_edges.go:184-194`, series `editspec/work_edges.go:305-316`, covers `editspec/work_media.go:106`, aliases `editspec/character_aliases.go:86`, links `editspec/work_links.go:166`). A non-automerge proposal can be filed with dangling ids and fail only at merge.

12. `editing.KindImageHash`, `KindI18nMap`, `KindRef` are declared (`editing/registry.go:15-22`) and published on the schema (`apiv2/repr/schema.go:19`) but no catalog field uses them. Covers and screenshots are `KindList` with `DiffHintImage`.

13. `applyTitles` overwrites `catalog_work.display_name` from the official title matching olang (`editspec/work_titles.go:173-175`). A patch that sets both `titles` and `display_name` does not have a documented apply order that preserves the display_name write.

14. Title suppression `KeyCheck` (`editspec/identity.go:19-36`) does not restrict kind to 0..2 or lang to `olangAllowed`. `title:99:xx:foo` is a valid companion payload.

15. Empty `lang` is allowed on work title aliases (`editspec/work_titles.go:89-92`) and rejected on character aliases (`editspec/character_aliases.go:42-43`).

16. `parseReleased` accepts `d=31` with `m=2` (`editspec/release.go:269`). Character `birthday_day` 31 is accepted regardless of `birthday_month` (`editspec/character.go:110-111`).

17. Cover `kind` is an open string of at most 64 runes (`editspec/work_media.go:66`). The public image type documents `main, dig, pkgfront, pkgback and friends` as an open vocabulary (`apiv2/repr/image.go:22`).

18. `image_hash` is a required string of at most 128 runes (`editspec/curated.go:104`, `editspec/work_media.go:58`). There is no charset or length-exact check in editspec.

19. `parseLinks` canonicalises URLs (`editspec/work_links.go:136`) and the snapshot returns the canonical form (`editspec/work_links.go:271-277`). A client that round-trips a twitter.com URL gets `https://x.com/<handle>` back.

20. Taxonomy types have a kungal overlay only (`editspec/taxonomy.go:49-59`). Work, character, and release also overlay `letmoe`, `letmoe-staging`, `letmoe-dev`.

21. `editspec/submit.go:14-26` mint `field_values` accepts only a subset of work fields (no covers, screenshots, credits, roster, or any `.suppressed`).

22. `applyRoster` holds no INSERT and no DELETE (`editspec/work_roster.go:84-89`). Adding a character through this field 422s at apply with "is not on this work's roster".

23. Roster spoiler error text says `1 (minor) or 2 (major)` (`editspec/work_roster.go:72`); constants are `SpoilerMild` / `SpoilerSevere` (`catalog/model/credit.go:7-8`); public vocab is `none, minor, major` (`apiv2/vocab/vocab.go:82-86`).

24. Cover/screenshot `violence` is 0/1/2 with no named constants. Public vocab is `tame, violent, brutal` (`apiv2/vocab/vocab.go:77-81`). `dto/read_dto.go:82` comments `0=safe 1=suggestive 2=explicit` for both sexual and violence.

25. `parseEnumI16` error is `fmt.Errorf("must be one of %v, or null", allowed)` (`editspec/character.go:284`), which Go prints as `must be one of [1 2 3], or null`.

26. `catalog.work.display_name` allows 500 runes (`editspec/work.go:295`); every other name field uses `maxNameRunes = 300` (`editspec/taxonomy.go:37`).

27. Release lang is `olangAllowed` plus `{ck, et, eu, fa, gl, kk}` (`editspec/release.go:26-28`). Work olang and character lang do not accept those six.

28. Intro lists accept only `en, ja, zh-Hans, zh-Hant` (`editspec/work_intros.go:13`), not the full olang set.

29. Optional object properties reject JSON `null`. `objInt` / `objString` / `objBool` type-assert the present value; null is not `float64`/`string`/`bool`. Omittable ≠ nullable.

30. `parseTitles` stores `title` untrimmed (`editspec/work_titles.go:114`) after only checking `TrimSpace(title) == ""`. Identity keys run `textnorm.Clean` on that title (`editspec/work_titles.go:186`). A leading space is stored on the row and stripped in the suppression key.

31. `editing/override.go` is not a policy overlay file. Policy overlays live on `EntityTypeSpec.SiteOverlays` (`editing/registry.go:144,165-174`).

32. GET `/v2/catalog/schemas/{object}` (`apiv2/handler/catalog_schema_routes.go:21`) does not include enum values, element shapes, or nullability. The schema the UI already consumes is a key/kind/diff_hint/caps list only (`apiv2/repr/schema.go:16-24`).

## 6. Mechanics I chose

- Registration is by entity type, not by per-field `Register`. The census is every `FieldSpec` in those `Fields` slices plus the `SuppressedFieldSpec` companions already in the same slices.
- `policy` is `EntityTypeSpec.DefaultPolicy`. No catalog `FieldSpec` sets `Policy`. `site_overrides` is `SiteOverlays[site][key]` for every site that names that key (kungal plus the three letmoe names on work/character/release; kungal only on taxonomy).
- `max_elements` is the cap `Validate` actually enforces, not the possibly-zero `FieldSpec.MaxElements`. When the spec leaves it 0, that cap is `editing.DefaultMaxElements` via `asArray` (`editspec/curated.go:103,111`).
- `max_suppressed` on a parent that has a companion is the companion's effective cap (parent `MaxSuppressed`, or 200 if the parent left it 0). On a list with no companion it is 0. On a scalar it is JSON `null`.
- `json_type` is the wire JSON type. `"integer"` means a JSON number that is a whole number; a string `"3"` is a 422. encoding/json on this face does not call `UseNumber`.
- Extra keys beyond the example (`json_type`, `nullable`, `site_overrides`, field-level `enum`/`enum_meaning`, `date_object` on `catalog.release.released`) are included because the example omitted them for scalars and they are what the UI will pre-validate against. `element.shape` for non-list fields is `"scalar"` as specified, even for the date object.
- Apply-time rules (existence, upstream collision, curated-only series) are listed under `validation` because the server enforces them; they fire at merge/automerge, not at `Validate`.
- Companion `identity` is the parent's identity format, because that is what the companion's contents must be.

## 7. What I could not determine

- The exact alphabet of `image_hash`. Editspec only requires a non-empty string ≤128 runes. The upload face (`POST /v2/me/edit-images`) returns `repr.EditImage.Hash`; I did not read the image service's hash format.
- The closed set of `catalog_role.id` values. They are seeded (`catalog/seed/seed.go`) and not exposed over HTTP. Validate only checks `role_id > 0`; apply checks existence and `is_deprecated`.
- Which violence labels the editor should show for 0/1/2. The validator says `0, 1 or 2` (`editspec/work_media.go:40`). Public vocab and dto comments disagree (see §5.24).
- Whether any non-v2 HTTP face maps these five errors differently. `internal/platform/catalog/handler` has no `CreateProposal` call. I treated v2 `proposalErr` as the wire.
- Whether a JSON decoder other than encoding/json default is ever installed on the catalog Fiber app. I found no `UseNumber` on this path; if one is added later, `int64` vs `float64` acceptance becomes load-bearing for the parsers that only accept `float64`.
- Cover `kind` accepted values beyond "any string ≤64 runes".
- Whether claim-mint `field_values` (`POST /v2/me/claims`) is in the edit-UI's write path. It is a different gate (`editspec/submit.go`) over a subset of work keys.
