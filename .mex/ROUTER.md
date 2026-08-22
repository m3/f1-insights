---
name: router
description: Session bootstrap and navigation hub. Read at the start of every session before any task. Contains project state, routing table, and behavioural contract.
edges:
  - target: context/architecture.md
    condition: when working on system design, integrations, or understanding how components connect
  - target: context/stack.md
    condition: when working with specific technologies, libraries, or making tech decisions
  - target: context/conventions.md
    condition: when writing new code, reviewing code, or unsure about project patterns
  - target: context/decisions.md
    condition: when making architectural choices or understanding why something is built a certain way
  - target: context/setup.md
    condition: when setting up the dev environment or running the project for the first time
  - target: patterns/INDEX.md
    condition: when starting a task — check the pattern index for a matching pattern file
last_updated: 2026-08-22
---

# Session Bootstrap

If you haven't already read `AGENTS.md`, read it now — it contains the project identity, non-negotiables, and commands.

Then read this file fully before doing anything else in this session.

## Current Project State

**Working:**
- Portal (port 3010), FastAPI backend (port 8000), pipeline + social-worker — all restored on m3-vps.
- Background async worker (`backend/app/worker/tasks.py`) completes a clean cycle: fetch → sync caches → `determine_macro_state` → idempotent notify → sleep 5m. The `should_trigger_*` `AttributeError`/`RetryError` crash is fixed.
- Cache DB rebuilt; `overview_cache.payload_json` carries `timeline.macroState` + `schema_version 5.0`.
- Idempotent notification triggers (post-quali → PRE_RACE, post-race → POST_RACE) wired via `data_pipeline/pipeline_common.py` `NotificationTrigger` + a `notification_log` table.
- `core_overview`/cache-writer/trigger logic extracted to `data_pipeline/pipeline_common.py` (schema 5.0 defined in one place); `data_pipeline/main.py` migrated off raw-SQL cache tables.
- Deps consolidated to `backend/requirements.txt` (single source of truth); all PM2 apps run on one canonical venv. SQLite `integrity_check` + rebuild-on-fail runs at backend startup.

**Not yet built:**
- Sprint-specific briefs (sprint quali / sprint race) — only main quali/race fire briefs today.

**Known issues:**
- None currently tracked.

<!-- Below this line is the template example, kept for reference. Replace as the state evolves.
     **Working:**
     - User authentication and session management
     **Not yet built:**
     - Email notification system
     **Known issues:**
     - Pagination breaks on filtered queries with more than 1000 results -->

## Routing Table

Load the relevant file based on the current task. Always load `context/architecture.md` first if not already in context this session.

| Task type | Load |
|-----------|------|
| Understanding how the system works | `context/architecture.md` |
| Working with a specific technology | `context/stack.md` |
| Writing or reviewing code | `context/conventions.md` |
| Making a design decision | `context/decisions.md` |
| Setting up or running the project | `context/setup.md` |
| Any specific task | Check `patterns/INDEX.md` for a matching pattern |

## Behavioural Contract

For every task, follow this loop:

1. **CONTEXT** — Load the relevant context file(s) from the routing table above. Check `patterns/INDEX.md` for a matching pattern. If one exists, follow it. Narrate what you load: "Loading architecture context..."
2. **BUILD** — Do the work. If a pattern exists, follow its Steps. If you are about to deviate from an established pattern, say so before writing any code — state the deviation and why.
3. **VERIFY** — Load `context/conventions.md` and run the Verify Checklist item by item. State each item and whether the output passes. Do not summarise — enumerate explicitly.
4. **DEBUG** — If verification fails or something breaks, check `patterns/INDEX.md` for a debug pattern. Follow it. Fix the issue and re-run VERIFY.
5. **GROW** — After meaningful work, run this binary checklist:
   - **Ground:** What changed in reality? Name the changed behavior, system, command, dependency, or workflow.
   - **Record:** If project state changed, update the "Current Project State" section above. If documented facts changed, update the relevant `context/` file surgically.
   - **Orient:** If this task can recur and no pattern exists, create one in `patterns/` using `patterns/README.md`, then add it to `patterns/INDEX.md`. If a pattern exists but you learned a gotcha, update it.
   - **Write:** Bump `last_updated` in every scaffold file you changed. If the why matters, run `mex log --type decision "<what changed and why>"` or `mex log "<note>"`.
