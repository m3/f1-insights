# Product Requirements Document (PRD)
## 🏎️ F1 Insights & Explanation Platform (v2026.13)

---

## 1. Executive Summary & Product Vision

**The One-Sentence Business Case & Value Statement:**
> *"F1 Insights helps Formula 1 fans understand why races unfold the way they do using evidence-backed analysis rather than raw timing data."*

The platform unifies disparate telemetry feeds (FastF1, Ergast/Jolpica API, TracingInsights GitHub archives) and media radar signals (X/Twitter, YouTube watchalongs) into a single, high-reliability modular monolith powered by FastAPI, SQLite (WAL mode), and a React Carbon Dark dashboard.

---

## 2. Governing Product Principle: The 4-Step Question Validation Test

Every feature, card, metric, and pipeline task added to F1 Insights MUST satisfy all four criteria before inclusion:
1. **Real User Question**: Is this a question a real fan, commentator, strategist, or fantasy player asks?
2. **Material Differentiation**: Is the answer materially better than what existing timing apps or broadcasts provide?
3. **Empirical Evidence**: Can the answer be supported by observable, traceable empirical evidence?
4. **Actionable Understanding**: Does the answer change how someone understands or watches the race?

---

## 3. Target User Personas

| Persona | Core Needs | Primary Features Used | Key Value Proposition |
| :--- | :--- | :--- | :--- |
| **Casual Fan** | Quick summaries, race context, "Why is someone winning?" | 30-Second Catch-up Briefing, Executive Summaries, Lap 1 Watchlist | Rapid orientation without wading through complex data tables. |
| **Dedicated Fan** | Strategic context, tyre cliffs, undercut windows, DRS trains | **Strategic Position Index**, **Traffic-Filtered Pace Estimate**, Pit Window Forecaster | Explains strategic implications of gaps and pit windows. |
| **Fantasy Player** | Position gain potential, penalty risks, reliability records | Position Gained Delta Tracker, FIA Penalty Watch, DNF Risk Watch | Actionable insights for driver lineup selection. |
| **Journalist / Creator**| Verified evidence, historical comparisons, structured briefs | 4-Field Evidence Debriefs, True Pace Rank, Head-to-Head Ratios | Fact-checked background for race debriefs and articles. |
| **AI / API Consumer** | Machine-readable APIs with provenance & confidence metadata | Model Context Protocol (FastMCP v4.0), REST APIs (`/api/v1/`) | Structured JSON tools with zero hallucination enforcement. |

---

## 4. Key Product Capabilities & Requirements

### 4.1. Hidden Pace Detector Engine
* **FR-0.3 Hidden Pace Filtering**: The system MUST filter lap records to isolate clear-air laps (gap to car ahead $\ge 1.0\text{s}$, non-Safety Car, non-pit laps, Lap $> 1$), ranking drivers by clear-air mean pace and identifying drivers trapped in DRS traffic with a position delta $\ge 2$.

### 4.2. Strategic Position Index (SPI) Engine
* **FR-0.2 Composite SPI Score**: The system MUST calculate an estimated strategic position score ($0\text{--}100$) for any active driver combining Tyre Life Delta ($35\%$), Clean-Air Traffic Gap ($25\%$), Pit Window Cushion ($25\%$), and Stint Degradation Slope ($15\%$).

### 4.3. Domain Graph Traversals & Strongly-Typed Models
* **FR-0.1 Domain Models Layer**: The system MUST implement strongly-typed Pydantic V2 schemas (`DomainDriver`, `DomainStint`, `DomainLap`, `DomainSector`) supporting graph traversals (`Driver` $\rightarrow$ `Stint` $\rightarrow$ `Lap` $\rightarrow$ `Sector`) and clear-air filtering.

### 4.4. 20-Driver Grid & Session Classification Table
* **FR-1.0 Complete 20-Driver Classification**: The system MUST render an un-truncated, 20-driver Race & Session Classification Table (`P1` through `P20` + Reserves), displaying Grid Start Position, Finish Position, Net Delta (`▲`/`▼`), Interval/Gap, Pit Stop Count, Stint Compounds, and Status (`Finished`, `+1 Lap`, `DNF`, `DNS`).

### 4.5. Telemetry & Pace Analysis
* **FR-1.1 Corner Pace Comparison**: The system MUST render overlay traces for any two driver codes (e.g. `NOR` vs `VER`) showing speed ($km/h$), gear selection, and throttle percentage across distance ($m$).
* **FR-1.2 Traffic-Filtered Pace Estimate**: The system MUST filter out Safety Car laps and laps where gap to car ahead is $< 1.0\text{s}$ to estimate clear-air pace capability.

### 4.6. FIA Penalty Watch & Race Control
* **FR-3.1 Points Accumulation Ledger**: The system MUST track accumulated FIA penalty points for all 20 drivers.
* **FR-3.2 Ban Threshold Early Warning**: Drivers accumulating $\ge 8$ points MUST be flagged as `at_risk` for an automatic 1-race suspension (12-point threshold).

### 4.7. AI Explanations & Delivery
* **FR-4.1 Epistemic Non-Fabrication Guarantee**: All AI-generated briefings MUST generate evidence-backed explanations consistent with available observations from SQLite/FastF1; if data is missing, the system MUST return fallback status without hallucinations.
* **FR-4.2 Multi-Channel Push**: Briefings MUST be dispatched asynchronously via Discord Webhooks and Telegram Bot APIs.

### 4.8. Model Context Protocol (MCP) Integration
* **FR-5.1 FastMCP Server**: The platform MUST expose a FastMCP server providing standard tools (`get_f1_overview`, `compare_corner_telemetry`, `get_fia_penalty_watch`, `get_trackside_media_sentiment`, `calculate_pit_strategy_loss`, `generate_morning_briefing`).

---

## 5. Technical Constraints & SLAs

* **API Response SLA**: P95 latency $< 150\text{ms}$ for cached overview endpoints (`/api/v1/overview`).
* **Database Mode**: SQLite 3 configured with Write-Ahead Logging (`WAL` mode) and synchronous `NORMAL` to ensure concurrency without thread deadlocks.
* **Security & Rate Limiting**: Nginx ingress rate limiting set to `30r/m burst=20`. Protected admin endpoints (`/api/v1/admin/*`) require `X-API-Key` validation.

---

## 6. Success Metrics & Acceptance Criteria

* ✅ **Test Coverage**: $> 90\%$ test coverage across API routes, data pipelines, domain models, and FastMCP tools (current: **31/31 passing tests**).
* ✅ **Zero Hallucination Rate**: $100\%$ compliance with non-fabrication rules during data gaps.
* ✅ **CI/CD Deployment Proven**: Automated GitHub Actions CI workflow executing local tests and rsync deployment to VPS with health checks.




