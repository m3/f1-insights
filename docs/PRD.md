# Product Requirements Document (PRD)
## 🏎️ F1 Insights & Morning Brief Platform (v2026.3)

---

## 1. Executive Summary & Product Vision

The **F1 Insights & Morning Brief Platform** is a production-grade sports intelligence system delivering real-time telemetry analysis, corner pace tracing, FIA penalty tracking, multi-channel social media sentiment analysis, and AI-driven race briefings to Formula 1 enthusiasts, team strategists, and sports media journalists.

The platform unifies disparate telemetry feeds (FastF1, Ergast/Jolpica API, TracingInsights GitHub archives) and media radar signals (X/Twitter, YouTube watchalongs) into a single, high-reliability modular monolith powered by FastAPI, SQLite (WAL mode), and a React Carbon Dark dashboard.

---

## 2. Target User Personas

| Persona | Core Needs | Primary Features Used | Key Value Proposition |
| :--- | :--- | :--- | :--- |
| **Paddock Analyst** | Corner speed comparison, throttle/braking overlays, pit loss time calculation. | Interactive Telemetry Chart, Pit Loss Matrix | Replaces manual telemetry exports with instant, sub-second overlay traces. |
| **Sports Journalist** | FIA penalty points monitoring, driver ban risks, media sentiment spikes. | FIA Penalty Watch, Social Media Radar | Automated early-warning flags when drivers approach 12 penalty points. |
| **Morning Brief Subscriber** | Fast, digested race weekend summaries delivered directly to Discord/Telegram. | Automated Briefing Engine, MCP Server tools | Zero-click morning intelligence delivered automatically post-session. |

---

## 3. Key Product Capabilities & Requirements

### 3.1. Telemetry & Pace Analysis
*   **FR-1.1 Corner Pace Comparison**: The system MUST render overlay traces for any two driver codes (e.g. `NOR` vs `VER`) showing speed ($km/h$), gear selection, and throttle percentage across distance ($m$).
*   **FR-1.2 Pit Strategy Loss Calculation**: The system MUST calculate expected pit stop delta loss across dry/wet conditions with automated safety car delta adjustments.

### 3.2. FIA Penalty Watch
*   **FR-2.1 Points Accumulation Ledger**: The system MUST track accumulated FIA penalty points for all 20 drivers.
*   **FR-2.2 Ban Threshold Early Warning**: Drivers accumulating $\ge 8$ points MUST be flagged as `at_risk` for an automatic 1-race suspension (12-point threshold).

### 3.3. Social Media & Media Radar
*   **FR-3.1 Channel Ingestion**: The system MUST ingest data from verified X accounts and YouTube watchalong channels (`@F1Gamer`, `@peterwindsor`, `@brrrake`, `@autosport`, `@donut`).
*   **FR-3.2 Sentiment Aggregation**: Telemetry and social feeds MUST be tagged with sentiment scores (`positive`, `neutral`, `critical`) per driver/constructor.

### 3.4. AI Morning Briefings & Delivery
*   **FR-4.1 Non-Fabrication Guarantee**: All AI-generated briefings MUST be grounded strictly in empirical data payloads from SQLite/FastF1; if data is missing, the system MUST return fallback status without hallucinations.
*   **FR-4.2 Multi-Channel Push**: Briefings MUST be dispatched asynchronously via Discord Webhooks and Telegram Bot APIs.

### 3.5. Model Context Protocol (MCP) Integration
*   **FR-5.1 FastMCP Server**: The platform MUST expose a FastMCP server providing 6 standard tools (`get_f1_overview`, `compare_corner_telemetry`, `get_fia_penalty_watch`, `get_trackside_media_sentiment`, `calculate_pit_strategy_loss`, `generate_morning_briefing`).

---

## 4. Technical Constraints & SLAs

*   **API Response SLA**: P95 latency $< 150\text{ms}$ for cached overview endpoints (`/api/v1/overview`).
*   **Database Mode**: SQLite 3 configured with Write-Ahead Logging (`WAL` mode) and synchronous `NORMAL` to ensure concurrency without thread deadlocks.
*   **Security & Rate Limiting**: Nginx ingress rate limiting set to `30r/m burst=20`. Protected admin endpoints (`/api/v1/admin/*`) require `X-API-Key` validation.

---

## 5. Success Metrics & Acceptance Criteria

*   ✅ **Test Coverage**: $> 90\%$ test coverage across API routes, data pipelines, and FastMCP tools (current: 21/21 passing tests).
*   ✅ **Zero Hallucination Rate**: $100\%$ compliance with non-fabrication rules during data gaps.
*   ✅ **Zero Downtime Updates**: PM2 process supervision with graceful restart support across all 3 services (`f1-backend`, `f1-pipeline-scheduler`, `f1-portal`).
