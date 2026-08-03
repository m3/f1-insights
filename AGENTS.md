# F1 Insights — Project Contract (LOCAL)

Local rules for this repo. Global behavioral policy is NOT inlined here; it is fetched at
boot and signed (hash + nonce). This file is the local map only.

rules: mcp://localhost:8888/mcp/hermes/rules@1

## What this is
A production-ready **Modular Monolith** for Formula 1 race pace analysis, corner telemetry traces, tyre degradation modelling, FIA penalty watch, multi-source X & YouTube media sentiment radar, and AI-generated race briefings (README.md:7). Live at https://f1.sports.superchargedbym3.com (README.md:9).

## Non-negotiable (local)
- Architecture is a modular monolith: FastAPI backend (port 8000) + React/Vite SPA (port 3010) behind an nginx reverse proxy; SQLite in WAL mode (`f1_insights.db`) is the single source of truth (README.md:29-51,58).
- The multi-source social-media schema is versioned in `data_pipeline/config/entities.json` (Schema v2026.3) — keep schema changes there, not ad hoc (README.md:49; file verified at that path).
- Hardening is mandatory: admin trigger endpoints (`/api/v1/admin/*`) are protected by an `X-API-Key`; nginx enforces IP rate limiting `30r/m burst=20` (README.md:64).
- CI/CD follows **M3-Conventions §3 (CI builds the artifact)**: GitHub Actions runs pytest + builds the React UI, then rsyncs the artifact to `/var/www/f1-insights/` and restarts/health-checks PM2 (README.md:65,98-116).

## Commands
From package.json / README.md:
- `npm run dev` (cd portal && npm run dev)
- `npm run build` (cd portal && npm run build)
- `npm run pipeline` (python3 data_pipeline/main.py)
- `npm run test` (python3 -m pytest -v); also `python3 -m pytest -v` (README.md:83-84)
- `npm run pm2:start` / `pm2:stop` / `pm2:restart` / `pm2:logs`

## Code graph
The repo is indexed in `.mex/graph.db`. First action on a task: `mex graph scope "<task>"`.
Never naive-grep the whole tree; expand nodes with `mex graph get <id> --detail source` and
check impact with `mex impact <symbol|file>`.

## Navigation
At session start read `.mex/ROUTER.md` + relevant `.mex/context/*` before acting. Update the
vault project card (10-Projects/F1 Insights.md) when status/architecture changes.