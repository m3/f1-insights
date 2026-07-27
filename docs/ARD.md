# Architecture Requirements & Decisions (ARD)
## 🏛️ F1 Insights & Morning Brief Platform (v2026.3)

---

## 1. Architectural Style & Overview

The system is designed as a **Modular Monolith** in Python 3.11+, supported by a single-page React frontend and an autonomous data pipeline worker daemon.

```mermaid
graph TD
    User["Web Browser Client"] --> |HTTPS / Port 443| Nginx["Nginx Reverse Proxy & SSL"]
    Nginx --> |Port 3010| Vite["React SPA Dashboard (Vite)"]
    Nginx --> |Port 8000| FastAPI["FastAPI Monolith Backend"]
    
    FastAPI --> |SQLite WAL Mode| DB[(f1_insights.db)]
    Worker["Data Pipeline Worker"] --> |FastF1 / Ergast APIs| DB
    Worker --> |Webhook| Discord["Discord Webhook / Telegram"]
    
    MCP["FastMCP Server (Port 8705 / SSE)"] --> |DB Queries| DB
```

---

## 2. Key Architecture Decision Records (ADRs)

### ADR-001: Modular Monolith over Microservices
*   **Context**: The application handles race weekend telemetry, FIA points, and AI briefing generation.
*   **Decision**: Adopt a Modular Monolith in Python (FastAPI).
*   **Rationale**: Eliminates network latency between microservices, simplifies deployments to a single VPS via PM2, and allows shared memory access to database schemas.

### ADR-002: SQLite in WAL Mode as Single Source of Truth
*   **Context**: Needs concurrent read access from FastAPI web requests, FastMCP tools, and background pipeline writes.
*   **Decision**: Use SQLite 3 with Write-Ahead Logging (`PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;`).
*   **Rationale**: Supports thousands of concurrent readers with zero lock contention. Eliminates the operational complexity of managing external PostgreSQL/MySQL instances for single-operator deployments.

### ADR-003: Dual-Layer Fallback Architecture
*   **Context**: External APIs (FastF1, Ergast, Jolpica) can experience outages during high-concurrency race weekends.
*   **Decision**: Implement a two-tiered fallback mechanism:
    1.  **Tier 1 (Database Cache)**: Query `MasterOverviewCache` table in SQLite (`f1_insights.db`).
    2.  **Tier 2 (Static Disk Asset)**: Fall back to static JSON feed at `portal/public/data/overview.json`.
*   **Rationale**: Guarantees $100\%$ uptime for the frontend dashboard even if SQLite or third-party APIs fail entirely.

### ADR-004: Native FastMCP Server for Agentic LLM Access
*   **Context**: AI agents (Claude, Gemini, Hermes) need clean, structured access to F1 telemetry and FIA data.
*   **Decision**: Deploy a dedicated FastMCP server (`mcp_server/main.py`) exposing standardized, versioned tool interfaces.
*   **Rationale**: Implements Schema v4.0 with provenance metadata (`confidence`, `source`, `generated_at`), enabling zero-prompting integration with LLM harnesses.

---

## 3. Data Flow Architecture

```mermaid
sequenceDiagram
    participant Pipeline as Data Pipeline Worker
    participant DB as SQLite DB (WAL)
    participant API as FastAPI Backend
    participant Client as React Dashboard
    
    Pipeline->>Pipeline: Fetch Ergast/FastF1 & YouTube Radar
    Pipeline->>DB: Write Master Overview & Telemetry Traces
    Client->>API: GET /api/v1/overview
    API->>DB: Query MasterOverviewCache (id='latest')
    DB-->>API: Return JSON Payload
    API-->>Client: 200 OK (JSON Payload)
```

---

## 4. Operational & Deployment Architecture

*   **Process Manager**: Managed via PM2 using [`ecosystem.config.js`](file:///Users/mathias/Development/Projects/f1-insights/ecosystem.config.js):
    *   `f1-backend`: FastAPI running under Uvicorn (`port 8000`).
    *   `f1-pipeline-scheduler`: Python daemon executing session checkpoints and briefing generation.
    *   `f1-portal`: Vite preview server (`port 3010`).
*   **Deployment Pipeline**: GitHub Actions implementing **M3-Conventions §3 (CI-builds-the-artifact)** via SSH/rsync to `m3-vps` with automated health checks (`/api/v1/health`).
