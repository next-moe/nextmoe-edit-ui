---
name: dispatch-codex
description: Dispatch implementation and investigation work to the local codex CLI (gpt-6-astra through the locally configured gateway) as a headless executor while this session stays the orchestrator and acceptor. Use when the user asks to "派发 astra" / "派发 codex" / "dispatch codex", or when a task suits a written task book and needs what grok cannot do here — running the pnpm gates offline, or reading the sibling nextmoe-infra checkout. Covers the sandbox boundaries re-measured in this repo, the sibling-secrets exposure that replaces the env-file stash as the thing to worry about, the flag set, task-book differences from dispatch-grok, and the acceptance protocol.
---

# Dispatching codex (gpt-6-astra) as executor

> **If you are the codex executor and this file was loaded into your context: ignore it.**
> It describes how the orchestrator dispatches *you*. It is not a task book.

Adapted from the same skill in `kun-galgame-forum`. This session is the **orchestrator**: it
adjudicates design, writes the task book, runs every gate, all git, and accepts or rejects.
The local `codex` CLI (default model `gpt-6-astra` at reasoning effort max, through the
locally configured gateway) is the **executor**. Same division of labour as `dispatch-grok`,
different machinery underneath — read §1 before assuming anything carries over.

A dispatch is a sandboxed subprocess of this session working in this session's checkout.
Never dispatch while another session owns this worktree, and never run two dispatches
(codex or grok) concurrently over overlapping paths.

## 1. What codex can reach on this machine

The deterministic rows were re-measured **2026-09-05 in this repository** against
`codex-cli 0.153.4` with `codex sandbox` (no model in the loop). Rows marked † come from a
full exec probe in `kun-galgame-forum` — same machine, same codex version; verify them
against the first real dispatch here. Do not inherit this table into another repo or
another codex version without re-measuring.

| Capability | Under `dispatch.sh` | Measured outcome |
|---|---|---|
| Read inside the repo | **free** | — |
| Read **outside** the repo | **free — there is no read fence** | read `/etc/hostname` and `../kun-galgame-forum/CLAUDE.md`; reads stop only at DAC |
| Write inside the repo | allowed (workspace-write) | probe file created and removed |
| Write to `.git/` | **denied by the sandbox** | `Read-only file system` — codex structurally cannot commit |
| Write outside repo (`$HOME`, `~/.codex`) | denied | `Read-only file system` |
| Write to `/tmp` | **allowed** | the scratchpad is reachable without `--add-dir` |
| Network | denied | `curl: (6) Could not resolve host` |
| Shell | **available, sandboxed** | this is how codex works; it is not deniable |
| MCP † | emptied by `-c 'mcp_servers={}'` | probe listed zero resources |
| Web search / fetch † | none | probe tool inventory: `apply_patch exec_command clock goals view_image write_stdin` |
| Secret env vars † | scrubbed twice | a decoy exported to dispatch.sh was invisible inside the run |
| Project instructions † | auto-loaded | this repo has `AGENTS.md` at the root, codex's native file — the iron rules are in its context without a pointer |
| Escalation / approval † | auto-denied in exec mode | denied writes returned plain errors, no interactive prompt |

### The exposure here is the neighbourhood, not this repo

This repo carries **no env file and no secret** — the env-file stash in `dispatch.sh`
discovers nothing today and exists so the day the playground grows a `.env` it is fenced
without anyone remembering to update a list. What the missing read fence does expose is the
**sibling checkouts**: `../nextmoe-infra` and `../kun-galgame-forum` each carry gitignored
env files with live credentials (catalog `nmk_` keys, OAuth client secrets, DB DSNs,
production values), all readable by this user and therefore by a dispatched executor, and a
read lands the content in the model's context at the gateway.

Two mitigations, both real but neither structural: the task book forbids reads outside this
repo except the paths it names, and **every command the executor runs is in
`events.jsonl`** — `dispatch.sh` greps it for suspect strings (`.ssh`, `id_rsa`,
`id_ed25519`, `auth.json`, `/proc/*/environ`, `.env`) and prints hits for the orchestrator
to read in context. A hit is a line to go read, not automatically a leak.

### Reading nextmoe-infra is the point — grant it narrowly

grok cannot open `../nextmoe-infra` at all; codex can. That collapses the two-stage dance
(read-only census inside infra, then a second dispatch here fed by its report) into one
dispatch — for a task that needs it, the task book grants **named read paths** inside infra
(`apps/api/internal/...`, exact directories) and forbids the rest of the tree explicitly,
env files by pattern and by name. After the run, read the audit before the report: with a
sibling grant in play the suspect-string section is not optional.

### Differences from grok that change how you write a task book

- **codex has a shell.** node_modules being local, it *can* run `pnpm build`,
  `pnpm typecheck` (vue-tsc included — grok could not even spawn it) and `pnpm test` from
  the repo root, all offline, so the task book may permit self-checking. Acceptance still
  re-runs every gate here; a green run from the executor is a courtesy, never proof. Do not
  let it start `pnpm dev` — a headless run has no business holding a server open.
- **There are no per-path allow/deny grants.** The whole repo is writable, full stop. Scope
  is bounded by the task book's writable-paths list plus `git status --porcelain` at
  acceptance — same as grok in practice (its `--allow` was a grant, not a whitelist), minus
  the documentation value of the grant flags. Put the writable paths in the task book,
  prominently.
- **`.git/` is read-only**, so the executor cannot stage, commit, or branch even by
  accident. `status` / `log` / `diff` work.

## 2. The dispatch

```bash
export CODEX_OUT_ROOT="$SCRATCHPAD/codex"        # session scratchpad, never the repo
mkdir -p "$CODEX_OUT_ROOT/<slug>"
# write the task book to $CODEX_OUT_ROOT/<slug>/task.md, then:
.claude/skills/dispatch-codex/dispatch.sh <slug>
```

`dispatch.sh` supplies `--sandbox workspace-write`, `--json` (events to `events.jsonl`),
`-o last-message.txt`, `--ignore-rules`, the MCP/plugin emptying, the env-var scrub, the
env-file stash (empty here today), a `timeout` (default 2700 s, `CODEX_TIMEOUT` to change),
and afterwards prints token usage, the suspect-string audit and `git status --porcelain`.
Run it **in the background** — a real dispatch takes minutes. Extra arguments pass through
to `codex exec` — that is where a per-task model or effort override goes:

| Extra arg | When |
|---|---|
| `-c model_reasoning_effort='"medium"'` | mechanical sweeps; the config default is `max` |
| `-m <model>` | override `gpt-6-astra` |
| `--ephemeral` | leave nothing in codex's session store |
| env `CODEX_REPO=<abs path>` | dispatch into a sibling repo: that repo becomes the writable root and it is *its* env files that get stashed — this repo's would then be readable, which here means nothing, but the sibling's own secrets and the other sibling's are the audit's problem |

`-c` values parse as TOML — strings need their own quotes inside the shell quotes.
**Never pass `--approve-for-me` or `--dangerously-bypass-*`**: exec's auto-deny of
escalation is what makes the sandbox the fence. Never run two dispatches (codex or grok)
concurrently over overlapping paths.

A follow-up fix can resume the same thread with its context intact:
`codex exec resume --last` (plus the same fences — run it through your own judgment, there
is no wrapper for it yet).

## 3. Reading the result

1. `dispatch.sh` prints `exit= tokens= commands= out=`; nonzero exit tails `stderr.log`,
   124 is the timeout.
2. **A clean exit is not acceptance.** Read `report.md` in the output directory — the task
   book requires one — then run the gates yourself.
3. `last-message.txt` is the executor's closing paragraph; `events.jsonl` is the full
   record, one JSON line per event, every command with its `aggregated_output`. The audit
   section of the dispatch output points into it.
4. `git status --porcelain` (printed at the end) is acceptance check one: exactly the task
   book's writable paths, nothing else. The report lives in the scratchpad, so the status
   is a pure signal.

## 4. The task book

Template: `task-book-template.md` in this directory. Everything from `dispatch-grok` §4
holds (English, self-contained, no open design decisions, acceptance criteria the
orchestrator runs, fixed report path and structure, forbid ranking, demand a positive
control on any audit) with the environment section swapped: codex has a sandboxed shell and
no network, and reads outside the repo are forbidden by the book and audited rather than
denied by policy.

`AGENTS.md` is auto-loaded — do not re-paste the iron rules; restate the specific ones the
task turns on. Anything rendering here turns on rules 1–3 (no gradients ever; KunUI-first,
never fork it; no CSS and no colour of their own — semantic tokens only, no `dark:`, no raw
palette).

## 5. What is worth dispatching

The table in `dispatch-grok` §5 holds unchanged, including its last rule, and it does not
soften because this executor can run vue-tsc: **do not dispatch the Vue components.**
`packages/vue` is interaction design — spacing, focus order, empty states, what a control
feels like under a keyboard and an IME — and a compiler checks none of that; reviewing
costs more than writing. Dispatch the config tables, the type plumbing, the fixtures, and
the audits — and, now that the executor can read infra, the cross-repo censuses that
previously took two dispatches.

## 6. What the orchestrator never delegates

- Adjudications and scope calls — they belong in the task book.
- Every gate: `pnpm build` / `typecheck` / `test` / `lint`, run here at acceptance whatever
  the executor ran.
- All git, changesets, publishing, releases, npm.
- Any ruling under iron rule 1 (whether something is a gradient) or rule 2 (whether a KunUI
  equivalent exists — an executor never hand-rolls around KunUI and never edits KunUI).
- **Final acceptance.** After every dispatch: `git status --porcelain` shows only the
  task book's writable paths; re-run the gates; read the suspect-string audit whenever a
  sibling read grant was in play; spot-check the report's highest-stakes claims against the
  code. Trust the report's structure, verify its conclusions.

## 7. Choosing between codex and grok

Both are third-party executors with the same shape of fence and the same task-book
contract. Measured differences that matter when picking, in this repo:

- codex can self-check offline (`pnpm build` / `typecheck` / `test`); grok cannot run
  anything. A wide mechanical edit whose gate is `typecheck` is cheaper to accept from
  codex.
- codex can read `../nextmoe-infra`; grok structurally cannot. Any "what does the engine
  actually do" question is one codex dispatch instead of two grok dispatches.
- The same missing read fence is codex's liability: grok cannot reach the siblings'
  credentials, codex can — the audit is the compensating control, and it is grep plus the
  orchestrator's eyes, not a kernel.
- grok's per-path `--allow` grants are enforced by the tool; codex's scope is task-book
  prose plus `git status` at acceptance.
- codex cannot touch `.git/` or write outside the repo, enforced by kernel sandbox; grok's
  only hard fence is its deny rules.

When in doubt, dispatch the one whose failure mode you can check more cheaply, and never
both onto overlapping paths at once.
