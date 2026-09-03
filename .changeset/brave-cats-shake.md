---
'@nextmoe/edit-ui-vue': minor
---

Surface merge conflicts and staleness on a proposal. `ProposalCard` accepts
`currentRevisionSeq` and `conflictKeys` (the engine's `ConflictError.Keys`) and
distinguishes the two states the engine distinguishes: a patch whose own fields
drifted is a hard conflict the merge will refuse, while a proposal merely behind
the head revision is a warning that still merges. `ReviewQueue` passes both
through with `currentRevisionSeqFor` / `conflictKeysFor`.
