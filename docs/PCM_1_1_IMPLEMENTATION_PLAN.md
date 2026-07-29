# F1 Insights — PCM 1.1 Implementation Plan & Engineering Roadmap

> **Sprint Goal**: Execute Platform Capability Model (PCM) 1.1 upgrade over 11.0 engineering hours to unlock **+14 new user questions** (bringing total answerable questions from 31 to 45), introducing the **Strategic Advantage Index**, **Hidden Pace Detection**, and **Explainable AI Evidence Chains**.

---

## 📊 Sprint Overview & ROI Metrics

| Metric | Current (PCM 1.0) | Target (PCM 1.1) | Net Gain |
| :--- | :---: | :---: | :---: |
| **Answerable User Questions** | 31 Questions | **45 Questions** | **+14 Questions (+45%)** |
| **Data Sources Ingested** | 4 Sources | **6 Sources** | **+2 Sources** (`OpenF1`, `FIA PDFs`) |
| **Signature Insights** | 0 Proprietary | **2 Flagship** | `Strategic Advantage`, `Hidden Pace` |
| **AI Output Architecture** | Prose Briefs | **3-Tier Evidence Chains** | Explainable AI ($70\% - 100\%$ Confidence) |
| **Total Engineering Hours** | — | **11.0 Hours** | 6 Discrete Tasks |

---

## 🛠️ Step-by-Step Execution Plan

---

### Step 1: Domain Models & Schema Layer (`1.0 Hour`)
**Goal**: Create strongly typed domain models for graph traversals (`Driver` $\rightarrow$ `Stint` $\rightarrow$ `Lap` $\rightarrow$ `Sector`).

* **Target File**: `data_pipeline/domain/models.py`
* **Actions**:
  * Define Pydantic V2 schemas: `DomainDriver`, `DomainStint`, `DomainLap`, `DomainSector`, `DomainTyre`, `DomainPitStop`, `DomainIncident`.
  * Add graph traversal helper methods (e.g. `stint.get_clear_air_laps(min_gap=1.0)`).
* **Verification**: `python3 -c "from data_pipeline.domain.models import DomainDriver; print('Models OK')"`

---

### Step 2: Strategic Advantage Index Engine (`1.5 Hours`)
**Goal**: Implement the composite 0–100 Strategic Advantage score.

* **Target File**: `data_pipeline/analytics/telemetry.py` (Class `F1AnalyticsEngine`)
* **Algorithm**:
  $$\text{Index} = 0.35(\text{Tyre Life Delta}) + 0.25(\text{Pit Window Safety}) + 0.25(\text{Clear Air Pace}) + 0.15(\text{ERS State})$$
* **Output Schema**:
  ```python
  {
      "driver": "NOR",
      "score": 88,
      "breakdown": {
          "tyre_life_delta": "+4 laps vs VER",
          "pit_cushion": "11.6s clear air",
          "clear_air_delta": "+0.42s/lap"
      },
      "confidence": 0.88
  }
  ```
* **Verification**: Add `test_strategic_advantage_index()` to `tests/test_analytics.py`.

---

### Step 3: Hidden Pace Detector Engine (`1.0 Hour`)
**Goal**: Filter out laps spent in DRS traffic (gap $< 1.0\text{s}$) to compute true clear-air race pace.

* **Target File**: `data_pipeline/analytics/telemetry.py`
* **Actions**:
  * Implement `detect_hidden_pace(race_name, session)` method.
  * Filter lap dataset: exclude Lap 1, pit in/out laps, SC/VSC laps, and traffic laps (gap to car ahead $< 1.0\text{s}$).
  * Compute baseline clear-air pace rank vs actual track position.
* **Output**: Identifies drivers where $\text{Clear Air Rank} > \text{Track Position}$.
* **Verification**: Add `test_hidden_pace_detection()` to `tests/test_analytics.py`.

---

### Step 4: OpenF1 Real-Time API Provider (`3.0 Hours`)
**Goal**: Ingest live car telemetry, gaps, positions, and track limits from `api.openf1.org`.

* **Target File**: `data_pipeline/providers/openf1_provider.py`
* **Actions**:
  * Implement `OpenF1Provider(BaseProvider)` with endpoints:
    * `fetch_car_data(session_key, driver_number)`
    * `fetch_positions(session_key)`
    * `fetch_laps(session_key)`
    * `fetch_track_limits_warnings(session_key)`
  * Export in `data_pipeline/providers/__init__.py`.
* **Verification**: Add `tests/test_openf1_provider.py`.

---

### Step 5: Explainable AI Evidence Chains & Briefs (`2.5 Hours`)
**Goal**: Upgrade `BriefGenerator` to emit 3-tier explainable chains (**Evidence** $\rightarrow$ **Reasoning** $\rightarrow$ **Conclusion**) with confidence ratings.

* **Target File**: `data_pipeline/generators/brief_generator.py`
* **Actions**:
  * Implement `EvidenceChainGenerator` class.
  * Calculate composite confidence score:
    $$\text{Confidence} = 0.40(\text{Telemetry}) + 0.30(\text{Timing}) + 0.20(\text{History}) + 0.10(\text{Weather})$$
  * Format pre-race and post-race briefs with explicit evidence lists and confidence percentages.
* **Verification**: Add `test_explainable_evidence_chains()` to `tests/test_analytics.py`.

---

### Step 6: Portal UI & Delivery Layer (`2.0 Hours`)
**Goal**: Create UI cards in React portal to render Strategic Advantage & Hidden Pace.

* **Target Files**:
  * `portal/src/components/StrategicAdvantageCard.jsx`
  * `portal/src/components/HiddenPaceCard.jsx`
  * `portal/src/App.jsx` (Include new cards)
* **Actions**:
  * Render 0–100 gauge for Strategic Advantage with evidence bullet points.
  * Render Hidden Pace rank comparison table.
* **Verification**: Run `npm run build` inside `portal/` to verify zero build errors.

---

## 🗓️ Engineering Task & Target Timeline

```
[TASK 1: Domain Models] ──→ [TASK 2: Strategic Index] ──→ [TASK 3: Hidden Pace] ──→ [TASK 4: OpenF1 Provider] ──→ [TASK 5: AI Evidence Chains] ──→ [TASK 6: UI & Build]
       (1.0h)                    (1.5h)                    (1.0h)                  (3.0h)                       (2.5h)                   (2.0h)
```

---

## 🧪 Testing & Verification Strategy

1. **Unit Tests**:
   * Run `python3 -m pytest -v` to ensure all existing 23 tests + new PCM 1.1 tests pass.
2. **Integration Verification**:
   * Run `PYTHONPATH=. python3 data_pipeline/main.py full` to verify `overview.json` is generated with `strategicAdvantage` and `hiddenPace` payloads.
3. **Build & Deploy**:
   * Commit, push to `main`, and verify GitHub Actions build and VPS deployment succeed.

---

Ready to begin execution with **Step 1: Domain Models & Schema Layer**!
