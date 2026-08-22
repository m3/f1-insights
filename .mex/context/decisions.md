---
name: decisions
description: Key architectural and technical decisions with reasoning. Load when making design choices or understanding why something is built a certain way.
triggers:
  - "why do we"
  - "why is it"
  - "decision"
  - "alternative"
  - "we chose"
edges:
  - target: context/architecture.md
    condition: when a decision relates to system structure
  - target: context/stack.md
    condition: when a decision relates to technology choice
# Decisions usually ground sparsely; add only symbols that implement the decision.
# Entry shape: { node: "function:<tier-1-id>", fingerprint: "mh:64:<hex>" }
grounds_to: []
last_updated: 2026-08-22
---

# Decisions

<!-- If a decision names its concrete implementation point, link it as below;
     do not anchor vague concepts:
```markdown
[`someFunction()`](mex://function:<tier-1-id>)
```
-->

<!-- HOW TO USE THIS FILE:
     Each decision follows the format below.
     When a decision changes: DO NOT delete the old entry.
     Mark it as superseded, add the new entry above it.
     The history must be preserved — this is the event clock. -->

## Decision Log

### Unify venv, cache schema, and pipeline primitives
**Date:** 2026-08-22
**Status:** Active
**Decision:** Collapse the two-venv and two-schema splits and the worker/main.py payload drift into a single source of truth: one canonical venv (`backend/venv`), `backend/requirements.txt` as the only requirements file, SQLAlchemy CQRS models as the only cache writer, and `data_pipeline/pipeline_common.py` as the single schema-v5.0 `core_overview` builder + idempotent `NotificationTrigger` (backed by a `notification_log` table).
**Reasoning:** Each split had accreted independently and caused the same class of failure: an interpreter missing a dependency, two writers to overlapping tables, or a payload field (`timeline`) missing from one builder.
**Consequences:** `data_pipeline/main.py` no longer writes raw-SQL `MasterOverviewCache`/`SocialFeedCache`; `ecosystem.config.js` points only at `backend/venv`; `fastf1` was added to `backend/requirements.txt` and `data_pipeline/requirements.txt` removed. Post-quali fires a `PRE_RACE` brief and post-race a `POST_RACE` brief, each once per race/session.

### Cache DB is disposable — drop-and-rebuild, don't recover
**Date:** 2026-08-22
**Status:** Active
**Decision:** `f1_insights.db` is treated as re-fetchable cache (races/drivers/standings empty; the only data is social/overview caches). On corruption, drop it and let `Base.metadata.create_all` + `CREATE TABLE IF NOT EXISTS` rebuild, then re-trigger the pipeline.
**Reasoning:** `.recover` was unavailable (Ubuntu sqlite3 lacks `sqlite_dbpage`) and `.dump` aborted on the corrupt table. The corruption ("2nd reference to page 32") was in a cache btree; nothing of value was lost.
**Consequences:** Add a startup `PRAGMA integrity_check` + rebuild-on-fail so this is self-healing; the crash-looping backend (mid-write kills) was the likely corruption cause, now fixed.

### Two-venv split (backend/venv vs .venv)
**Date:** 2026-08-22
**Status:** Superseded by "Unify venv, cache schema, and pipeline primitives"
**Decision:** Backend runs on `backend/venv` (has `hishel`, missing `fastf1`); pipeline/social-worker registered on `.venv` (has `fastf1`, missing `hishel`). `ecosystem.config.js` prefers `backend/venv`.
**Reasoning:** The venvs accreted independently; `hishel` was added to `backend/requirements.txt` only, `fastf1` only to the pipeline's `.venv`.
**Consequences:** ~~Unify to one canonical venv with the union of deps and a single requirements source.~~ Done: single `backend/venv`, `backend/requirements.txt` is the sole source.

### Two cache schemas (SQLAlchemy vs raw SQL)
**Date:** 2026-08-22
**Status:** Superseded by "Unify venv, cache schema, and pipeline primitives"
**Decision:** The worker writes via SQLAlchemy models (`overview_cache`, `social_cache`, `payload_json` column); `data_pipeline/main.py` writes raw-SQL tables (`MasterOverviewCache`, `SocialFeedCache`, `data_json`). Same data, two writers.
**Consequences:** ~~Standardize on the SQLAlchemy models; migrate `main.py` off raw `CREATE TABLE`; drop the duplicate tables.~~ Done: `main.py` now uses `pipeline_common.sync_caches_to_db`.

### Notification triggers deferred (not yet built)
**Date:** 2026-08-22
**Status:** Superseded by "Unify venv, cache schema, and pipeline primitives"
**Decision:** `tasks.py` called `should_trigger_pre_race_update/post_race_debrief` — methods that never existed. Replaced with `determine_macro_state`; the notify dispatch is left unimplemented, matching `main.py`'s `pass` stub and `ARCHITECTURE_V2.md`'s "future" session-checkpoint triggers.
**Reasoning:** Restoring the methods would invent unbuilt business logic; guessing trigger semantics risks spammy Discord broadcasts.
**Consequences:** ~~Implement trigger rules from `determine_macro_state().macroState` transitions (post-quali + post-race) with idempotency.~~ Done: `NotificationTrigger.dispatch_if_due` + `notification_log` idempotency.

<!-- Document key decisions using the format below.
     Include decisions that: are non-obvious, have important constraints,
     or where the reasoning prevents future mistakes.
     Do not document every decision — only ones where "why" matters.
     Minimum 3 decision entries during initial population. If you cannot identify 3,
     write placeholder entries with "[TO DETERMINE]" and explain what decision is pending.

     Format for each entry:

     ### [Decision Title]
     **Date:** YYYY-MM-DD (check git history for real dates when possible)
     **Status:** Active | Superseded by [title]
     **Decision:** [What was decided, in one sentence]
     **Reasoning:** [Why this was chosen]
     **Alternatives considered:** [What else was considered and why it was rejected]
     **Consequences:** [What this means for the codebase going forward]

     Example:

     ### Use PostgreSQL for all persistent storage
     **Date:** 2024-03-01
     **Status:** Active
     **Decision:** All persistent data lives in PostgreSQL, no secondary databases.
     **Reasoning:** Simplicity — one database to operate, backup, and reason about.
     **Alternatives considered:** Redis for sessions (rejected — adds operational complexity for minimal gain), MongoDB for user preferences (rejected — relational model fits our data).
     **Consequences:** No caching layer at database level. Application-level caching if needed.

     Example of a superseded entry:

     ### Use Redis for session storage
     **Date:** 2024-02-15
     **Status:** Superseded by "Use PostgreSQL for all persistent storage"
     **Decision:** Store user sessions in Redis.
     **Reasoning:** Fast read/write for session data.
     **Alternatives considered:** PostgreSQL (chosen later due to operational simplicity).
     **Consequences:** ~~Requires Redis infrastructure alongside PostgreSQL.~~
     **Superseded because:** Maintaining two data stores added operational complexity
     without meaningful performance benefit for our scale. -->
