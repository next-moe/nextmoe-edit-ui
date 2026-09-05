# Task: <one line, imperative, what gets built>

You are the **executor**. The orchestrator wrote this task book; it is self-contained.
You cannot see the orchestrator's conversation. Everything you need is below.

## Context

Repository: `<absolute path to this checkout, filled in at dispatch time>` (your working
directory). Branch: `main` at `<short sha>`. pnpm workspace: `packages/core`
(framework-free TS), `packages/vue` (.vue components), `packages/nuxt` (Nuxt module),
`packages/catalog` (field presets), `apps/playground` (private Nuxt app).

<Where the relevant code lives — exact paths. What it does today. Why it is changing.
Every prior adjudication this task depends on, stated inline. If the reader would have to
ask "why this way and not the obvious way", answer it here.>

## Your environment (read this, it is not the usual one)

- **You have a shell, inside a sandbox.** The repository is writable; everything else on
  disk is read-only, `.git/` included, and there is **no network**. A command that hits the
  wall gets a plain error (`Read-only file system`, DNS failure) — that is the sandbox
  working, not a bug to route around. Never request escalation; it is auto-denied.
- <Keep the self-check lines the task needs; delete the rest.>
  You **may** run `pnpm build`, `pnpm typecheck` and `pnpm test` from the repo root — all
  work offline. Do **not** start `pnpm dev` or any server. The orchestrator re-runs every
  gate after you finish either way; a clean run is a courtesy, not proof.
- **No MCP servers, no web search.** Everything you need is in this repo and this book.
- Reads outside the repository are physically possible but **forbidden**, except the exact
  paths granted below. Every command you run is logged and audited afterwards. Never open
  a `.env`-shaped file anywhere, and never read `~/.ssh`, `~/.codex`, or another repo's
  gitignored files.
- <Delete unless the task grants sibling reads:> You **may read, never write**, these
  paths in `../nextmoe-infra`: `<exact directories>`. The rest of that repo — its `.env`
  files above all — is out of bounds.
- Read `AGENTS.md` at the repo root **first**; its iron rules bind you.

## Binding constraints for this task

<Name the specific rules, with the file and the quoted line. Not "follow the docs".
Anything rendering turns on iron rules 1–3: no gradient backgrounds ever; KunUI-first,
never fork or modify it; no CSS and no colour of these packages' own — KunUI semantic
tokens only, never `dark:` prefixes, never raw Tailwind palette colours.>

- `AGENTS.md`: "<quoted line>"
- Arrow functions everywhere in TS/Vue; no `function` declarations.
- `@nextmoe/edit-ui-core` stays framework-free: no `vue` in its dependency closure, not
  even a type-only import.
- <Delete unless the task adds a control or component:> A new control goes into
  `EDIT_CONTROLS` in `packages/core` (the union is derived from it); a new Vue component
  goes into `EDIT_UI_COMPONENT_NAMES` or the Nuxt module will not register it.

## Scope

1. <numbered, concrete, each independently checkable>
2. …

## Out of scope

- <what a helpful executor would otherwise wander into>
- Renaming, reformatting, or refactoring anything not named in Scope.

## Precedent to follow

<Point at existing code that already does this correctly: file:line. Say what to copy — the
shape, the error handling, the naming, the comment discipline — and what not to.>

## Acceptance criteria

The orchestrator will run these after you finish:

- `pnpm build`, `pnpm typecheck` and `pnpm test` must be green at the workspace root.
- Test `<name>` in `<file>` must pass.
- `git status --porcelain` must show **only** the writable paths below.

## Report

Write your report to this exact absolute path:

    <CODEX_OUT_ROOT>/<slug>/report.md

Structure:

```
# Report: <task>

## 1. What I changed
(file:line per change, one line each, what and why)

## 2. Anything that looks wrong — in scope or not
(report every one, at the same weight, with file:line and the quoted line. Something outside
 this task's scope belongs here, not in section 5, and not with a note that it was out of scope.
 Report it; do not fix it.)

## 3. Mechanics I chose
(any decision the task book left to the code — what you picked and the precedent you followed)

## 4. Deviations from the task book
(if none, write "None.")

## 5. What I could not verify
(everything the sandbox blocked, plus what the orchestrator should check, specifically,
 not just "run the tests")
```

Your final stdout message: one short paragraph, the report path plus a one-line status.
Do not paste the report into stdout.

## Discipline

- Writable paths — **exactly** these, nothing else anywhere:
  - `<glob 1>`
  - the report path above
- Forbidden: any git command that mutates state (`status` / `log` / `diff` are fine);
  reads outside this repository beyond what this book grants; touching `.changeset/`
  (versioning is the orchestrator's); hand-editing
  `packages/catalog/schema/inventory.json` (it is a census of the engine, re-taken, never
  edited).
- **Comments are earned by a mistake that already happened, not one you predict**
  (`AGENTS.md`, "Comments"). Default to none. Do not add section banners, restatements of
  the code, or doc comments that echo the identifier. Where this task book tells you *why*
  something is ordered or excluded, that reason is worth a short comment; the mechanism is
  not.
- **Report, don't work around.** If something is missing, contradictory, or blocked, stop
  and write it in section 4 or 5. A blocked task reported accurately is a success; a task
  completed by inventing around the block is not.
- **Do not rank, score, or filter your findings.** Report every one flat, at equal weight.
  Never demote something to "minor", "cosmetic", or "out of scope" — that judgement is the
  orchestrator's and yours will be wrong.
- <Delete unless the task is a search, audit, or census:> **Include a positive control.**
  List what you checked that came back clean, with counts, so a zero can be believed.
