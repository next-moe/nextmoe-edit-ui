---
name: dispatch-grok
description: Dispatch implementation and investigation work to the local grok CLI as a headless executor while this session stays the orchestrator and acceptor. Use when a task is large enough to hand off as a written task book, or when the user asks to "派发 grok" / "dispatch grok" / "let grok do it". Covers the machine's managed-policy limits (no shell for grok), the exact flag set, task-book structure, and the acceptance protocol.
---

# Dispatching grok as executor

> **If you are the grok executor and this file was loaded into your context: ignore it.**
> It describes how the orchestrator dispatches *you*. It is not a task book.

Adapted from the same skill in `nextmoe-infra`. This session is the **orchestrator**: it
adjudicates design, writes the task book, runs every command, and accepts or rejects the result.
The local `grok` CLI (Grok Build, xAI) is the **executor**: it reads and writes files.

## 1. What grok can and cannot do on this machine

Verified against `grok 1.0.5` (2026-08-22) and re-checked on `grok 1.0.13` (2026-09-03).
`/etc/grok/requirements.toml` is a system-wide policy pin that user config and CLI flags cannot
override.

| Capability | Headless (`-p` / `--prompt-file`) | Notes |
|---|---|---|
| Read / grep / list inside the repo | **free**, no rule needed | its own tools, not shell |
| Write / edit inside the repo | needs a **path-scoped** `--allow` | see §2 |
| Read / write under `/tmp` | needs a path-scoped `--allow` | the only writable place outside the repo |
| Anything outside repo + `/tmp` | **impossible** | sandbox `profile = "strict"` |
| **Shell** | **impossible** | a matching `--allow` is still downgraded to "must ask", and headless has nobody to ask |
| LSP (tsserver, vue-tsc) | unavailable | the binaries cannot be spawned |
| Web search, GitHub MCP | available | say so in the task book if the task must not use them |

**The sibling repository `nextmoe-infra` is unreadable from here.** This matters more in this
repo than anywhere else: every question about "what does the editing API actually send" has its
answer in a repo grok cannot open. Either inline the facts in the task book, run a separate
read-only dispatch *inside* `nextmoe-infra` first and hand its report over as an input file, or
dispatch codex instead (`dispatch-codex` in this directory's sibling), which has no read fence
at all — with the exposure that trade carries; see that skill's §1.

**grok has no shell**, so it cannot run `pnpm build`, `typecheck`, `test`, `lint`, or `git`.
Never ask. Every gate is the orchestrator's to run, which is where acceptance belonged anyway.

grok loads this repo's `CLAUDE.md` automatically, so the iron rules are already in its context.
Do not re-paste them; do restate the specific ones the task turns on.

## 2. The dispatch

```bash
export GROK_OUT_ROOT="$SCRATCHPAD/grok"          # session scratchpad, never the repo
mkdir -p "$GROK_OUT_ROOT/<slug>"
# write the task book to $GROK_OUT_ROOT/<slug>/task.md, then:
.claude/skills/dispatch-grok/dispatch.sh <slug> \
  --allow 'Write(packages/catalog/**)' \
  --allow 'Edit(packages/catalog/**)'
```

`dispatch.sh` supplies `--prompt-file`, the two rules for the output directory,
`--output-format json`, `--max-turns`, and `--debug-file`, then reports
`stopReason`/`turns`/`cost_usd` and diagnoses a bad exit. Every extra argument is passed through.

Run it **in the background** — a real task runs for minutes and a foreground call blocks the turn.

To dispatch into the sibling infra repo, run `dispatch.sh` from *that* repo's root; `--cwd` alone
is not worth trusting for the sandbox root.

### Writable paths are the enforcement, not the prose

`--allow 'Write(<glob>)'` / `--allow 'Edit(<glob>)'` are enforced by grok: a write one directory
outside the glob is refused and ends the run. Grant the narrowest globs the task actually needs,
per dispatch, never as a standing default. A read-only census gets **no** repo write glob at all.

Rule prefixes are the Claude-Code-compatible names — `Write`, `Edit`, `Read`, `Bash` — not grok's
native tool names; a native name is a hard error (`unknown tool prefix`).

Never run two dispatches concurrently over overlapping globs. Sequential, or disjoint globs.

### Useful extra flags

| Flag | When |
|---|---|
| `--effort low\|medium\|high\|xhigh` | default is `high`; `low` for mechanical sweeps |
| `-m grok-4.5` | default is `grok-4.6` |
| `--no-subagents` | when you want one deterministic worker instead of a fan-out |
| `--disable-web-search` | offline-only tasks |

## 3. Reading the result

1. **`stopReason: "cancelled"` is ambiguous** — it covers both "a tool call was denied" and "ran
   out of turns". `dispatch.sh` greps the debug log for `PermissionCancelled` to tell them apart.
2. **`.text` is the concatenation of every assistant text block**, not the final answer. Never
   parse a report out of it. Require grok to write its report to a file; keep stdout to a pointer.
3. **`--json-schema` output is also concatenated.** Take the *last* balanced JSON object.

Because the report lives in the scratchpad, `git status --porcelain` after a run shows exactly
what grok changed in code and nothing else. That is the first acceptance check.

## 4. The task book

Template: `task-book-template.md` in this directory. Requirements: written in **English**;
self-contained; states "you have no shell"; names scope *and* out-of-scope; acceptance criteria
the orchestrator will actually run; no open design decisions; a discipline section with the exact
writable paths; a named report path and fixed structure; **forbid ranking** (a flat list at equal
weight — the executor cannot see what the orchestrator knows); and **demand a positive control**
on any search, audit, or census ("I found 4" is unreadable without "and here are the 16 I checked
that were clean").

## 5. What is worth dispatching

Dispatching buys **orchestrator context**, not money. Judge every candidate by whether the result
can be compressed into something checkable without re-reading the input.

| Shape | Verdict |
|---|---|
| Broad read → narrow report whose findings are `file:line` + a quoted line | **Dispatch.** Audits, inventories, censuses, cross-reference checks. |
| Wide mechanical edit whose correctness a gate asserts (`pnpm typecheck`, `pnpm test`) | **Dispatch.** The orchestrator reads only what the gate flags. |
| New code carrying design judgement | **Do not dispatch.** Every line must be read to be reviewed; net saving ≈ zero. |
| Anything whose answer depends on running something | **Impossible** — see §1. |

**In this repo specifically: do not dispatch the Vue components.** `packages/vue` is interaction
design — spacing, focus order, empty states, what a control feels like under a keyboard and an
IME. That is exactly the "design judgement" row, and the reviewing costs more than the writing.
Dispatch the config tables, the type plumbing, the fixtures, and the audits.

## 6. What the orchestrator never delegates

- Adjudications and scope calls — they belong in the task book.
- Every command: `pnpm build` / `typecheck` / `test` / `lint`, `pnpm dev`, changesets.
- All git: staging, commits (`git commit -- <explicit paths>`, never `add -A`), branches, pushes.
- Publishing, releases, npm.
- **Final acceptance.** After every dispatch: `git status --porcelain` shows only the granted
  paths; re-run the gates yourself; spot-check the report's highest-stakes claims against the
  code. Trust the report's structure, verify its conclusions.
