# Data Sources & TracingInsights Integration

`f1-insights` leverages multiple open and public Formula 1 data sources.

---

## 1. TracingInsights Repositories

[TracingInsights](https://github.com/TracingInsights) hosts comprehensive telemetry datasets:

| Repository / Source | Data Type | Usage in `f1-insights` |
| :--- | :--- | :--- |
| `TracingInsights/2026` | Telemetry & Lap Times | Real-time session telemetry (speed, gear, RPM, throttle, braking) |
| `TracingInsights-Archive/stats` | Historical Ergast DB | 1950–Present historical race results, qualifying, driver/constructor records |
| `TracingInsights-Archive/PenaltyPoints` | Driver Penalty Points | Current penalty points status, 12-point ban warnings, and expiration dates |
| `TracingInsights-Archive/PitStops` | Pitstop Timings | Stationary pitstop durations and strategy stint profiles |
| `TracingInsights/RaceData` (HuggingFace) | CSV Archives | Bulk lap times & sector deltas |

---

## 2. Jolpica F1 API (Ergast Replacement)

- **Base URL**: `https://api.jolpi.ca/ergast/f1`
- **Schedule**: `GET /2026.json` (Race dates, circuit IDs, local times)
- **Standings**: `GET /current/driverStandings.json` & `GET /current/constructorStandings.json`

---

## 3. Fallback Mechanism

The pipeline includes built-in offline fallbacks (`fetchers/tracing_insights.py`) to guarantee that the portal and morning briefs render seamlessly even during rate limits or network unavailability.
