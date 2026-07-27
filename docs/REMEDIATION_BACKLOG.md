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

### Task P1-1: Migrate Pydantic Class Config to `SettingsConfigDict`
*   **File**: [`backend/app/core/config.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/core/config.py#L28-L31)
*   **Issue**: Class-based `Config` emits `PydanticDeprecatedSince20` warnings.
*   **Action**: Replace with Pydantic V2 `SettingsConfigDict`:
    ```python
    from pydantic_settings import BaseSettings, SettingsConfigDict

    class Settings(BaseSettings):
        ...
        model_config = SettingsConfigDict(
            case_sensitive=True,
            extra="ignore",
            env_file=".env"
        )
    ```

### Task P1-2: Eliminate `sys.path` Runtime Mutations
*   **Files**: [`backend/app/main.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/main.py#L15-L17) & [`mcp_server/main.py`](file:///Users/mathias/Development/Projects/f1-insights/mcp_server/main.py#L22-L23)
*   **Issue**: Dynamic `sys.path.insert(0, ...)` can create module resolution ambiguity.
*   **Action**: Structure project with a top-level `setup.py` / `pyproject.toml` or install backend as an editable package (`pip install -e .`).

### Task P1-3: Configure Pytest Asyncio Default Loop Scope
*   **File**: `pytest.ini` / `pyproject.toml`
*   **Issue**: Pytest emits `PytestDeprecationWarning` regarding unset `asyncio_default_fixture_loop_scope`.
*   **Action**: Add `asyncio_default_fixture_loop_scope = function` to configuration.

---

## 🟢 P2 — UI/UX & Integration Enhancements

### Task P2-1: Optimize Mobile Touch Targets
*   **File**: `portal/src/components/TelemetryChart.jsx`
*   **Action**: Increase dropdown and toggle button height to $\ge 44\text{px}$ for mobile touch interaction.

### Task P2-2: Add SSE Endpoint Rate Limiting
*   **File**: [`backend/app/api/v1/endpoints/mcp_sse.py`](file:///Users/mathias/Development/Projects/f1-insights/backend/app/api/v1/endpoints/mcp_sse.py)
*   **Action**: Apply SlowAPI rate limiter to MCP SSE connection requests (`10 connection attempts/minute`).

---

## ⚪ P3 — Maintenance & Documentation

### Task P3-1: Update OpenAPI Docstrings & Examples
*   **File**: `backend/app/api/v1/endpoints/*.py`
*   **Action**: Enrich FastAPI endpoint parameter docstrings with schema descriptions for OpenAPI interactive documentation.
