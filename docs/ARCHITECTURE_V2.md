# 🏎️ `f1-insights` Production Architecture Specification (v2.0)
**Document Status**: Baseline Architectural Blueprint  
**Target Scale**: ~100 Concurrent Users • Solo Developer Operations • Low Overhead • High Weekend Reliability  
**Deployment Model**: Single VPS Containerized Modular Monolith  

---

## 1. Executive Architecture Overview

The **`f1-insights`** platform is evolving from an automated static-export script prototype into a production-grade, highly maintainable **Modular Monolith**. 

### **Design Philosophy & Core Directives**
1. **Low Operational Overhead**: Designed to be operated and maintained by a single developer with AI assistance. Operational simplicity takes precedence over distributed enterprise complexity.
2. **Single-Node Modular Monolith**: Rather than splitting into microservices, the entire backend runs inside a unified, highly concurrency-efficient Python process (FastAPI + Async Worker + Calendar Scheduler) communicating with an embedded, ACID-compliant **SQLite (WAL Mode)** database.
3. **Database as Single Source of Truth**: All raw telemetry, circuit metadata, driver standings, penalty points, and AI-generated insights are stored in SQLite. Static JSON files are treated strictly as transient caches or fallback targets.
4. **API-First Architecture**: The React + Vite SPA frontend communicates exclusively via structured REST endpoints provided by FastAPI, backed by Redis/In-Memory response caching.
5. **Persistent Async Workers & Shared Connections**: Eliminates process startup overhead. HTTP sessions (`httpx.AsyncClient`) and DB connections are shared across persistent background tasks.
6. **Calendar-Aware Dynamic Scheduling**: Eliminates redundant API polling during the off-season while automatically ramping up to real-time polling intervals during Formula 1 session windows (FP, Quali, Sprint, Race).

---

## 2. High-Level Architecture Diagram

```
                               ┌─────────────────────────────────────────────────────────┐
                               │                    CLIENT LAYER                         │
                               │  • React + Vite SPA Dashboard (Browser / Mobile)        │
                               │  • Discord Webhooks / Telegram Bot Subscribers          │
                               └────────────────────────────┬────────────────────────────┘
                                                            │
                                                            │ HTTP / REST (/api/v1/*)
                                                            ▼
                               ┌─────────────────────────────────────────────────────────┐
                               │               GATEWAY & REVERSE PROXY                   │
                               │  • Nginx / Caddy                                        │
                               │    - Serves compiled React static assets                │
                               │    - Handles TLS termination, Gzip, CORS, Rate Limits   │
                               │    - Proxies /api/v1 requests to FastAPI                │
                               └────────────────────────────┬────────────────────────────┘
                                                            │
                                                            ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                           FASTAPI MODULAR MONOLITH                                              │
 │                                                                                                                 │
 │  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌───────────────────────────────┐  │
 │  │        REST API LAYER           │   │      CALENDAR SCHEDULER        │   │    ASYNC WORKER & PIPELINE    │  │
 │  │  • Telemetry, Sessions, Drivers │   │  • Race-Week State Machine      │   │  • Telemetry Ingestion        │  │
 │  │  • Standings, Penalty Watch     │   │  • Dynamic Polling Intervals    │   │  • Social Feed Aggregator     │  │
 │  │  • Briefing & Social Endpoints  │   │  • Session Checkpoint Triggers  │   │  • Shared HTTPX Async Client  │  │
 │  └────────────────┬────────────────┘   └────────────────┬────────────────┘   └───────────────┬───────────────┘  │
 │                   │                                     │                                    │                  │
 └───────────────────┼─────────────────────────────────────┼────────────────────────────────────┼──────────────────┘
                     │                                     │                                    │
                     ▼                                     ▼                                    ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                           PERSISTENCE & STORAGE LAYER                                           │
 │                                                                                                                 │
 │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │                                   SQLite (WAL Mode)                                                  │  │
 │  │  • Master CQRS Cache Tables (JSON Blobs) for zero-latency dashboard rendering                        │  │
 │  │  • Relational schema for historical Standings, Briefs, and Schedule                                  │  │
 │  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                           EXTERNAL INTEGRATIONS                                                 │
 │                                                                                                                 │
 │  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐  │
 │  │  TracingInsights Repos│   │  Jolpica / Ergast API │   │   X & YouTube Feeds   │   │   LLM API (OpenAI)    │  │
 │  │  • Telemetry & Laps   │   │  • Standings/Calendar │   │   • News & Watchalongs│   │   • Structured Briefs │  │
 │  └───────────────────────┘   └───────────────────────┘   └───────────────────────┘   └───────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Service Breakdown

### **1. Gateway & Reverse Proxy (Nginx / Caddy)**
- **Purpose**: Unified entrypoint for incoming HTTP/HTTPS traffic.
- **Responsibilities**:
  - Serves pre-compiled frontend static bundle (`/dist`).
  - Proxies API traffic (`/api/v1/*`) to the backend container.
  - Enforces TLS termination, HTTP/2, Gzip compression, and IP-based rate limiting.
- **Failure Handling**: Serves custom offline error pages if backend is restarting.
- **Scaling**: Single instance handles 10,000+ requests/sec easily.

### **2. Backend API Service (FastAPI)**
- **Purpose**: Serves dynamic data to the frontend dashboard and external clients.
- **Responsibilities**:
  - Exposes RESTful endpoints for telemetry, schedule, standings, penalty points, and briefs.
  - Implements response caching (in-memory LRU cache / Redis-ready).
  - Handles administrative manual triggers via API key authentication.
  - Exposes `/health` and `/metrics` (Prometheus) endpoints.
- **Dependencies**: SQLite database.
- **Scaling**: Asynchronous ASGI server (`uvicorn` with 2–4 workers).

### **3. Data Engine & Async Background Worker**
- **Purpose**: Persistent background task execution without process restart overhead.
- **Responsibilities**:
  - Fetches external API updates (Jolpica, TracingInsights, X/YouTube feeds).
  - Executes telemetry calculations (clean-air pace, tyre degradation slopes, corner speed deltas).
  - Maintains persistent `hishel.AsyncCacheClient` connection pools.
  - Implements exponential backoff and circuit breaker logic for external API failures.
- **Dependencies**: Shared HTTP Client, SQLite (Cache Tables).

### **4. Calendar-Aware Scheduler**
- **Purpose**: Controls data fetching frequency based on Formula 1 calendar state.
- **Responsibilities**:
  - Evaluates current race weekend state (Off-season, Race week, FP1/FP2/FP3, Quali, Race).
  - Ramps up polling frequency dynamically during active sessions.
  - Triggers AI Briefing generation post-qualifying and post-race.

### **5. AI Briefing Engine**
- **Purpose**: Synthesizes telemetry and race data into structured narrative briefings.
- **Responsibilities**:
  - Queries database for verified numerical facts (Fact Engine).
  - Constructs prompt templates (Jinja2).
  - Calls LLM APIs (OpenAI GPT-4o / OpenRouter).
  - Validates response schemas using Pydantic before storing/publishing.

### **6. Notification Bus**
- **Purpose**: Multi-channel broadcast service.
- **Responsibilities**:
  - Formats briefings into Discord Embeds and Telegram Markdown.
  - Dispatches notifications independently of user HTTP requests.

---

## 4. Repository Directory Structure

```
f1-insights/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── telemetry.py
│   │   │   │   │   ├── schedule.py
│   │   │   │   │   ├── standings.py
│   │   │   │   │   ├── drivers.py
│   │   │   │   │   ├── briefs.py
│   │   │   │   │   ├── social.py
│   │   │   │   │   └── system.py
│   │   │   │   └── router.py
│   │   │   └── dependencies.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   ├── db/
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── fetchers/
│   │   │   │   ├── jolpica.py
│   │   │   │   ├── tracing_insights.py
│   │   │   │   └── social.py
│   │   │   ├── analytics/
│   │   │   │   ├── race_pace.py
│   │   │   │   ├── tyre_deg.py
│   │   │   │   └── telemetry.py
│   │   │   ├── ai/
│   │   │   │   ├── facts_engine.py
│   │   │   │   ├── prompt_builder.py
│   │   │   │   └── pipeline.py
│   │   │   └── notifier/
│   │   │       ├── discord.py
│   │   │       └── telegram.py
│   │   ├── worker/
│   │   │   ├── scheduler.py
│   │   │   └── tasks.py
│   │   └── main.py
│   ├── tests/
│   │   ├── test_api.py
│   │   ├── test_analytics.py
│   │   └── test_ai_pipeline.py
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── BriefCard.jsx
│   │   │   ├── TelemetryChart.jsx
│   │   │   ├── PenaltyWatch.jsx
│   │   │   ├── TeammateBattles.jsx
│   │   │   ├── StandingsView.jsx
│   │   │   └── SocialSentiment.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── config/
│   └── entities.json
├── docker/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── Caddyfile
├── docs/
│   ├── ARCHITECTURE_V2.md
│   ├── DATA_SOURCES.md
│   └── NOTIFICATIONS.md
├── scripts/
│   ├── backup_db.sh
│   └── run_pipeline.sh
└── .env.example
```

---

## 5. Database Design & Storage Strategy

The database uses **SQLite 3** configured in **Write-Ahead Logging (WAL)** mode for concurrent read/write throughput. 
Instead of executing heavy SQL JOINs on every page load, the pipeline employs a **CQRS (Command Query Responsibility Segregation)** pattern. The async worker calculates complex telemetry and writes pre-computed JSON blobs into single-row `Cache` tables. The FastAPI endpoints simply read and serve these JSON strings, resulting in sub-millisecond API response times for the React frontend.

### **PRAGMA Optimization Settings (SQLite)**
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA cache_size = -64000; -- 64MB cache
PRAGMA foreign_keys = ON;
```

### **Core Schema DDL**

```sql
-- CQRS Cache Tables (Pre-computed JSON for Instant API Responses)
CREATE TABLE IF NOT EXISTS master_overview_cache (id TEXT PRIMARY KEY, payload_json TEXT);
CREATE TABLE IF NOT EXISTS telemetry_cache (id TEXT PRIMARY KEY, payload_json TEXT);
CREATE TABLE IF NOT EXISTS strategy_cache (id TEXT PRIMARY KEY, payload_json TEXT);
CREATE TABLE IF NOT EXISTS social_cache (id TEXT PRIMARY KEY, payload_json TEXT);

-- Season Calendar & Sessions
CREATE TABLE IF NOT EXISTS races (
    id TEXT PRIMARY KEY, -- e.g., '2026-11'
    season INTEGER NOT NULL,
    round INTEGER NOT NULL,
    race_name TEXT NOT NULL,
    circuit_id TEXT NOT NULL,
    circuit_name TEXT NOT NULL,
    locality TEXT NOT NULL,
    country TEXT NOT NULL,
    race_date DATE NOT NULL,
    race_time_utc TEXT,
    has_sprint BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS race_sessions (
    id TEXT PRIMARY KEY, -- e.g., '2026-11-FP1', '2026-11-Q'
    race_id TEXT NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL, -- FP1, FP2, FP3, SPRINT_QUALIFYING, SPRINT, QUALIFYING, RACE
    session_date DATE NOT NULL,
    session_time_utc TEXT,
    status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, COMPLETED, ANALYZED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers & Constructors
CREATE TABLE IF NOT EXISTS drivers (
    driver_id TEXT PRIMARY KEY, -- e.g., 'norris'
    code TEXT UNIQUE NOT NULL, -- e.g., 'NOR'
    number INTEGER,
    given_name TEXT NOT NULL,
    family_name TEXT NOT NULL,
    nationality TEXT,
    current_team TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS driver_standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season INTEGER NOT NULL,
    round INTEGER NOT NULL,
    position INTEGER NOT NULL,
    points REAL NOT NULL,
    wins INTEGER NOT NULL,
    driver_id TEXT NOT NULL REFERENCES drivers(driver_id),
    constructor_name TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Penalty Points Tracker
CREATE TABLE IF NOT EXISTS penalty_points (
    driver_code TEXT PRIMARY KEY REFERENCES drivers(code),
    points INTEGER NOT NULL DEFAULT 0,
    max_points INTEGER DEFAULT 12,
    is_at_risk BOOLEAN GENERATED ALWAYS AS (points >= 8),
    next_expiry_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Briefings
CREATE TABLE IF NOT EXISTS briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id TEXT NOT NULL REFERENCES races(id),
    brief_type TEXT NOT NULL, -- 'PRE_RACE' or 'POST_RACE'
    title TEXT NOT NULL,
    markdown_content TEXT NOT NULL,
    facts_json TEXT NOT NULL, -- Serialized fact cards
    prompt_version TEXT NOT NULL,
    llm_model TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social & Media Feed
CREATE TABLE IF NOT EXISTS social_posts (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL, -- 'X' or 'YOUTUBE'
    author_handle TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content_text TEXT NOT NULL,
    metrics_json TEXT, -- Likes, Retweets, Views
    weight REAL DEFAULT 0.5,
    posted_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Query Acceleration
CREATE INDEX IF NOT EXISTS idx_races_season_round ON races(season, round);
CREATE INDEX IF NOT EXISTS idx_race_sessions_date ON race_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_standings_season_round ON driver_standings(season, round);
CREATE INDEX IF NOT EXISTS idx_briefs_race_type ON briefs(race_id, brief_type);
```

### **Data Retention Strategy**
- **Race Metadata, Standings & Briefs**: Retained permanently (small storage footprint, ~20MB/year).
- **Telemetry Parquet Cache**: Telemetry files stored in `./data/telemetry_cache/` retained for 2 seasons (~1.5GB total). Older seasons purged via automated background script.

---

## 6. REST API Design (FastAPI)

All endpoints return standardized JSON payloads adhering to OpenAPI 3.0 specs.

### **Core Endpoints**

| Category | HTTP Method | Path | Description |
| :--- | :---: | :--- | :--- |
| **System** | `GET` | `/api/v1/health` | Health check & system status |
| | `GET` | `/api/v1/metrics` | Prometheus metrics endpoint |
| **Schedule** | `GET` | `/api/v1/schedule` | Season calendar with session status |
| | `GET` | `/api/v1/schedule/current` | Current or next Grand Prix details |
| **Telemetry** | `GET` | `/api/v1/telemetry/compare` | Corner telemetry speed/throttle comparison |
| | `GET` | `/api/v1/telemetry/pace` | Fuel-corrected clean air race pace deltas |
| **Drivers** | `GET` | `/api/v1/drivers` | Grid driver list and team mappings |
| | `GET` | `/api/v1/drivers/penalty-watch` | Driver penalty points status & ban risks |
| **Standings** | `GET` | `/api/v1/standings/drivers` | World Driver Championship standings |
| | `GET` | `/api/v1/standings/constructors` | World Constructor Championship standings |
| **Briefings** | `GET` | `/api/v1/briefs/latest` | Latest Pre-Race Preview or Post-Race Debrief |
| | `POST` | `/api/v1/admin/trigger-brief` | Admin override to re-generate AI brief |
| **Social** | `GET` | `/api/v1/social/feed` | Combined X news feed & YouTube watchalongs |

---

## 7. Background Worker & Async Pipeline Design

Rather than executing transient Python scripts via PM2 or cron, a **long-running Python worker** runs inside the FastAPI process container using `asyncio`.

```
                        ┌────────────────────────────────────────┐
                        │       PERSISTENT ASYNC WORKER          │
                        └───────────────────┬────────────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           ▼                                ▼                                ▼
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ Shared HTTP Client  │          │ Rate-Limit Handler  │          │  Circuit Breaker    │
│ (httpx.AsyncClient) │          │ (Token Bucket)      │          │  (Tenacity Retry)   │
└─────────────────────┘          └─────────────────────┘          └─────────────────────┘
```

### **Worker Execution Principles**
1. **Shared Connection Pooling**: A single `httpx.AsyncClient(limits=httpx.Limits(max_keepalive_connections=20, max_connections=100))` is instantiated at app startup and reused across all tasks.
2. **Resilient Retry Policy**: Wrapped with `tenacity` retries (3 attempts, exponential backoff starting at 2s) for external network requests.
3. **Queue Architecture**: Uses `asyncio.Queue` for background jobs (e.g., dispatching Discord webhooks, updating social feeds) preventing blocking of the main API looper thread.

---

## 8. Calendar-Aware Scheduler Design

The scheduler replaces naive time-based cron jobs with an **F1 Calendar State Machine** that adjusts polling intervals based on session proximity.

```
                   ┌──────────────────────────────────────────────────┐
                   │             F1 CALENDAR STATE MACHINE            │
                   └────────────────────────┬─────────────────────────┘
                                            │
        ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
        ▼                   ▼                               ▼                   ▼
┌───────────────┐   ┌───────────────┐               ┌───────────────┐   ┌───────────────┐
│  OFF-SEASON   │   │   RACE WEEK   │               │ LIVE SESSIONS │   │ POST-SESSION  │
│  (Nov - Feb)  │   │  (Mon - Thu)  │               │ (FP, Quali,   │   │ (+45m Buffer) │
│               │   │               │               │  Race)        │   │               │
│ Poll: 24h     │   │ Poll: 6h      │               │ Poll: 2 - 5m  │   │ Run AI Brief  │
└───────────────┘   └───────────────┘               └───────────────┘   └───────────────┘
```

### **Polling Matrix by Calendar State**

| Calendar State | Condition | Telemetry Polling | Social Feed Polling | Action Triggered |
| :--- | :--- | :---: | :---: | :--- |
| **Off-Season** | Nov 30 – Feb 15 | Every 24 Hours | Every 12 Hours | Standings/Calendar sync |
| **Mid-Week** | Mon 00:00 – Thu 12:00 | Every 6 Hours | Every 1 Hour | Penalty points sync |
| **Pre-Race Window** | Fri 00:00 – Sat 12:00 | Every 1 Hour | Every 15 Minutes | **Generate Pre-Race Brief** |
| **Active Session** | FP1, FP2, FP3, Quali, Race | Every 2 Minutes | Every 5 Minutes | Live lap & telemetry ingest |
| **Post-Session** | Session End + 45 Mins | Single Pass | Single Pass | **Generate Post-Race Brief** |

---

## 9. AI Pipeline Architecture

The AI Briefing engine follows a strict, decoupled multi-stage pipeline guaranteeing deterministic facts before calling any LLM.

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   FACT ENGINE   │────►│ PROMPT BUILDER   │────►│  LLM EXECUTION   │────►│ SCHEMA VALIDATOR │
│ (SQL/DuckDB)    │     │ (Jinja2 Template)│     │ (OpenAI / Claude)│     │ (Pydantic Schema)│
└─────────────────┘     └──────────────────┘     └──────────────────┘     └─────────┬────────┘
                                                                                    │
                                                                                    ▼
                                                                          ┌──────────────────┐
                                                                          │  PUBLISH ENGINE  │
                                                                          │ (DB / Discord /  │
                                                                          │  Telegram / Web) │
                                                                          └──────────────────┘
```

---

## 10. VPS Deployment (PM2 & Ecosystem)

The monolith is deployed natively on a single VPS (Ubuntu) using **PM2** for process management instead of Docker, reducing memory overhead and complexity.

### **`ecosystem.config.js`**

```javascript
module.exports = {
  apps: [
    {
      name: "f1-insights-api",
      script: "uvicorn",
      args: "main:app --host 127.0.0.1 --port 8000 --workers 2",
      cwd: "/var/www/f1-insights/backend",
      interpreter: "python3",
      env: {
        ENVIRONMENT: "production",
        SQLITE_DB_PATH: "/var/www/f1-insights/backend/f1_insights.db"
      }
    }
  ]
};
```

### **Nginx Reverse Proxy**
Nginx serves the statically built React assets from `/var/www/f1-insights/frontend/dist` and proxies `/api` to `127.0.0.1:8000`. TLS is handled by Certbot.

---

## 11. Observability, Monitoring & Health Checks

1. **Structured Logging**: JSON logging using `structlog`.
2. **Health Endpoint (`/api/v1/health`)**: Reports DB WAL status and pipeline run status.
3. **Metrics Endpoint (`/api/v1/metrics`)**: Prometheus exporter metrics.

---

## 12. Security Guidelines

1. **API Keys & Secrets**: Injected at container runtime.
2. **CORS Policy**: Configured in FastAPI middleware.
3. **Rate Limiting**: Enforced via `slowapi`.

---

## 13. Incremental Migration Plan

- **Phase 1: SQLite & FastAPI Layer** (Deploy FastAPI alongside current PM2 script setup).
- **Phase 2: Persistent Worker** (Shift telemetry analytics to async background worker).
- **Phase 3: Frontend API Switch** (Point React frontend to `/api/v1/*` REST endpoints).
- **Phase 4: Docker Compose Deployment** (Cut over to containerized Nginx/FastAPI monolith).
