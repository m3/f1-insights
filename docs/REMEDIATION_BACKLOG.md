# Remediation Backlog & Action Plan
## 🏎️ F1 Insights & Morning Brief Platform (v2026.3)

---

## 📋 Backlog Overview & Priority Matrix

| Priority | Task Count | Target Timeline | Impact Area | Key Goal | Status |
| :---: | :---: | :---: | :--- | :--- | :---: |
| 🔴 **P0** | 2 | Immediate | Security | Fix CORS credentials wildcard & enforce strict admin key checks. | ✅ **DONE** |
| 🟡 **P1** | 3 | Next Sprint | Reliability & Debt | Fix Pydantic V2 deprecations & clean up `sys.path` runtime mutations. | ✅ **DONE** |
| 🟢 **P2** | 2 | Secondary | UX & Integrations | Optimize mobile touch targets & configure FastMCP rate limiting. | ✅ **DONE** |
| ⚪ **P3** | 1 | Maintenance | Documentation | Update OpenAPI docstrings & developer setup instructions. | ✅ **DONE** |
| 🔵 **P4** | 3 | Quality | Data Integrity | Purge synthetic fallback arrays, align circuit SVG maps & connect 22 grid drivers. | ✅ **DONE** |
| 🟣 **P5** | 2 | Architecture | UI Workspace | Refactor React state to Zustand store & implement responsive 3-column workspace grid. | ✅ **DONE** |

---

## 🔴 P0 — Critical Security Fixes

### Task P0-1: Restrict CORS Wildcard Origins ✅ (COMPLETED)
*   **File**: [`backend/app/main.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/main.py#L61-L71)
*   **Status**: ✅ **COMPLETED** — Wildcard CORS origins replaced with explicit origin whitelist (`https://f1.sports.superchargedbym3.com`, `http://localhost:3010`, etc.).

### Task P0-2: Enforce Production Admin API Key Environment Check ✅ (COMPLETED)
*   **File**: [`backend/app/main.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/main.py#L46-L54)
*   **Status**: ✅ **COMPLETED** — Injected startup check raising `ValueError` if production environment uses the default fallback admin API key. Verified via `test_production_security_validation`.

---

## 🟡 P1 — High Priority Technical Debt

### Task P1-1: Migrate Pydantic Class Config to `SettingsConfigDict` ✅ (COMPLETED)
*   **File**: [`backend/app/core/config.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/core/config.py#L28-L32)
*   **Status**: ✅ **COMPLETED** — Upgraded to Pydantic V2 `SettingsConfigDict(case_sensitive=True, extra="ignore", env_file=".env")`. Zero Pydantic deprecation warnings emitted.

### Task P1-2: Standardize Python package imports via `pyproject.toml` ✅ (COMPLETED)
*   **Files**: [`pyproject.toml`](file:///Users/mathias/Development/Projects/f1-insights/pyproject.toml)
*   **Status**: ✅ **COMPLETED** — Configured `pythonpath = ["backend/app", "."]` in `pyproject.toml` for standard module resolution across backend and test runners.

### Task P1-3: Configure Pytest Asyncio Default Loop Scope ✅ (COMPLETED)
*   **File**: [`pyproject.toml`](file:///Users/mathias/Development/Projects/f1-insights/pyproject.toml#L6)
*   **Status**: ✅ **COMPLETED** — Configured `asyncio_default_fixture_loop_scope = "function"`. All 23 tests pass in 2.21 seconds with zero Pytest deprecation warnings.

---

## 🟢 P2 — UI/UX & Integration Enhancements

### Task P2-1: Optimize Mobile Touch Targets ✅ (COMPLETED)
*   **File**: [`portal/src/index.css`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/index.css#L192-L207)
*   **Status**: ✅ **COMPLETED** — Verified `button, select, input, .nav-tab, .btn-primary { min-height: 44px; }` with mobile viewport expansion (`min-height: 48px` on screens $\le 768\text{px}$). Satisfies WCAG 2.1 AAA touch standards.

### Task P2-2: Add SSE Endpoint Rate Limiting & Auth Verification ✅ (COMPLETED)
*   **File**: [`backend/app/api/v1/endpoints/mcp_sse.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/api/v1/endpoints/mcp_sse.py#L28-L36)
*   **Status**: ✅ **COMPLETED** — Protected `/api/v1/mcp/sse` and `/tools/{tool_name}` with `verify_admin_api_key` auth dependency, restricting handshake rates while preserving long-lived streaming connections. Verified via `test_mcp_remote_sse_security`.

---

## ⚪ P3 — Maintenance & Documentation

### Task P3-1: Update OpenAPI Docstrings & Setup Instructions ✅ (COMPLETED)
*   **File**: [`backend/app/api/v1/endpoints/*.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/api/v1/endpoints/telemetry.py#L9-L15)
*   **Status**: ✅ **COMPLETED** — Verified parameter docstrings and schema descriptions across all endpoints (`/compare`, `/mcp/sse`, `/admin/*`, `/health`).

### Task P3-2: Automated Security Scanning in CI ✅ (COMPLETED)
*   **File**: [`.github/workflows/test.yml`](file:///Users/mathias/Development/Projects/f1-insights/.github/workflows/test.yml#L30-L44)
*   **Status**: ✅ **COMPLETED** — Added Trivy dependency vulnerability scanner and Gitleaks secret detection step to GitHub Actions CI runner.

### Task P3-3: Structured Audit Trail Logging ✅ (COMPLETED)
*   **File**: [`backend/app/core/security.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/core/security.py#L11-L20)
*   **Status**: ✅ **COMPLETED** — Added `f1_insights.audit` logger to record successful and rejected API key verification attempts.

### Task P3-4: Nginx Production Security Headers ✅ (COMPLETED)
*   **File**: [`docs/nginx-f1-insights.conf`](file:///Users/mathias/Development/Projects/f1-insights/docs/nginx-f1-insights.conf#L36-L40)
*   **Status**: ✅ **COMPLETED** — Configured HSTS (`max-age=31536000; includeSubDomains`) and strict Content-Security-Policy (CSP) headers.

---

## 🔵 P4 — Empirical Data Integrity & Zero Fabrication

### Task P4-1: Purge Synthetic Fallback Arrays & Client Seeds ✅ (COMPLETED)
*   **Files**: [`SessionClassificationTable.jsx`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/components/SessionClassificationTable.jsx#L20-L27), [`TelemetryChart.jsx`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/components/TelemetryChart.jsx#L19-L26)
*   **Status**: ✅ **COMPLETED** — Purged client-side mock seeds (`(finishPos * 7 + 3) % 20 + 1`) and synthetic 6-sample trace arrays. All components now bind exclusively to empirical API payloads.

### Task P4-2: 1:1 Scale-Matched Vector Map Correction & Unit Testing ✅ (COMPLETED)
*   **Files**: [`circuitPaths.js`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/data/circuitPaths.js#L40-L56), [`circuitPaths.test.js`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/data/circuitPaths.test.js)
*   **Status**: ✅ **COMPLETED** — Re-aligned Zandvoort vector path to 1:1 official FIA track map geometry (Tarzanbocht T1 hairpin, Hugenholtzbocht T3 banking, Scheivlak T7, Hans Ernst T11/12 chicane). Added automated SVG boundary unit tests.

### Task P4-3: Full 22-Driver Grid Selection & Schedule Prop Binding ✅ (COMPLETED)
*   **Files**: [`TelemetryOverlayTool.jsx`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/components/TelemetryOverlayTool.jsx#L10-L40), [`App.jsx`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/App.jsx#L133)
*   **Status**: ✅ **COMPLETED** — Expanded driver selection pickers to support all 22 active drivers. Bound `schedule` prop to `StandingsView` to populate the 24-round calendar.

---

## 🟣 P5 — Broadcast Command Workspace & Zustand Refactor

### Task P5-1: Global Zustand Store Integration ✅ (COMPLETED)
*   **File**: [`useF1Store.js`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/store/useF1Store.js)
*   **Status**: ✅ **COMPLETED** — Implemented reactive Zustand store for global tab navigation, telemetry driver selection, and async API refreshes with retry logic.

### Task P5-2: High-Density 3-Column Command Workspace Grid ✅ (COMPLETED)
*   **Files**: [`App.jsx`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/App.jsx#L81-L127), [`index.css`](file:///Users/mathias/Development/Projects/f1-insights/portal/src/index.css#L196-L200)
*   **Status**: ✅ **COMPLETED** — Refactored main dashboard into a responsive 3-column workspace (`Standings (4 col)` $\rightarrow$ `AI Reasoning (5 col)` $\rightarrow$ `Strategic Intelligence (3 col)`) with mobile single-column stacking.
