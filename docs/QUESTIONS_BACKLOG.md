# F1 Insights — Master Questions Backlog & Strategic Reasoning Matrix (v2026.10)

> **Governing Principle**: *"Every feature added MUST satisfy the 4-Step Question Validation Test. F1 Insights helps Formula 1 fans understand why races unfold the way they do using evidence-backed analysis rather than raw timing data."*

---

## ⚖️ The 4-Step Question Validation Test

1. **Real User Question**: Is this a question a real fan, commentator, strategist, or fantasy player asks?
2. **Material Differentiation**: Is the answer materially better than what existing timing apps or broadcasts provide?
3. **Empirical Evidence**: Can the answer be supported by observable, traceable empirical evidence?
4. **Actionable Understanding**: Does the answer change how someone understands or watches the race?

---

## 📊 Master Category Summary (105 Questions)

| Category | Total | Answerable (Yes) | Partial (Inferred/AI) | Unanswerable (Data Gap) | Signature Feature Focus |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Race Strategy (STRAT)** | 8 | 5 | 3 | 0 | Live Strategic Position Index & Pit Loss |
| **2. Driver Performance (DRIVER)** | 8 | 6 | 2 | 0 | Expected Pace vs Car Capability Baseline |
| **3. Team Engineering (TEAM)** | 8 | 6 | 1 | 1 | High-speed vs Low-drag telemetry profiles |
| **4. Racecraft (RACECRAFT)** | 6 | 5 | 1 | 0 | Lap 1 & Defense Index |
| **5. Championship Intelligence (CHAMP)** | 5 | 5 | 0 | 0 | Dynamic Permutations & Momentum |
| **6. Reliability (REL)** | 6 | 4 | 1 | 1 | Component Wear & Pit Stop Reliability |
| **7. Weather Intelligence (WEATHER)** | 5 | 4 | 1 | 0 | Grip Trend & Crossover Point |
| **8. Historical Context (HIST)** | 7 | 7 | 0 | 0 | Comeback & Pole Conversion Rates |
| **9. Storyline Intelligence (STORY)** | 7 | 4 | 2 | 1 | Milestones & Pressure Radar |
| **10. AI Reasoning Layer (AI)** | 10 | 8 | 2 | 0 | **Evidence-Backed Explanation Engine** |
| **11. Post-Race Intelligence (POST)** | 10 | 8 | 2 | 0 | "Why did the winner actually win?" |
| **TOTAL** | **80** | **62 (78%)** | **15 (18%)** | **3 (4%)** | **105 Questions Mapped** |

---

## ⏱️ 1. Race Strategy Questions (Major Gap Solved)

| ID | Question | Status | Where / How We Answer | Why Not (If Gap) | Value |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **STRAT-01** | *Is Driver X faster because of fresher tyres or genuine pace?* | 🟢 **YES** | `TyreDegSimulator.jsx` / Stint age delta vs baseline lap pace | — | 🔥 **Critical** |
| **STRAT-02** | *Did Team X undercut or overcut successfully?* | 🟢 **YES** | `PitStrategyCalculator.jsx` / Out-lap delta comparison | — | 🔥 **Critical** |
| **STRAT-03** | *Who has the strategic advantage right now? (Tires, battery, clean air)* | 🟢 **YES** | **Strategic Position Index (SPI)** (Composite score) | — | 🔥 **Critical** |
| **STRAT-04** | *If the race stays green, who wins?* | 🟡 **PARTIAL** | Predictive lap decay extrapolation model | Requires live SC probability weighting | 🔥 **Critical** |
| **STRAT-05** | *If Safety Car comes within 5 laps, who benefits?* | 🟢 **YES** | `PitStrategyCalculator.jsx` / Free pit window evaluator | — | 🔥 **Critical** |
| **STRAT-06** | *Which drivers can realistically 1-stop?* | 🟢 **YES** | `TyreDegSimulator.jsx` / Compound cliff limit calculator | — | 🟡 **High** |
| **STRAT-07** | *Which teams boxed too early into traffic?* | 🟢 **YES** | `BriefCard.jsx` / Traffic gap delta at pit exit | — | 🟡 **High** |
| **STRAT-08** | *Who is currently under fuel / ERS saving?* | 🟡 **PARTIAL** | Throttle lift-and-coast delta in `TelemetryOverlayTool.jsx` | Full fuel flow is hidden FIA telemetry | 🟡 **High** |

---

## 🏎️ 2. Driver Performance Intelligence

| ID | Question | Status | Where / How We Answer | Why Not (If Gap) | Value |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **DRIVER-01** | *Is Driver X outperforming the car capability?* | 🟢 **YES** | Teammate mean baseline vs actual lap time delta | — | 🔥 **Critical** |
| **DRIVER-02** | *Who extracted the most from qualifying?* | 🟢 **YES** | Car rank vs qualifying grid position delta | — | 🔥 **Critical** |
| **DRIVER-03** | *Biggest overachiever this weekend* | 🟢 **YES** | **Evidence-Backed Explanation Engine** / Overperformance score | — | 🟡 **High** |
| **DRIVER-04** | *Biggest underperformer this weekend* | 🟢 **YES** | **Evidence-Backed Explanation Engine** / Teammate delta & grid drops | — | 🟡 **High** |
| **DRIVER-05** | *Which driver is making the fewest mistakes?* | 🟡 **PARTIAL** | Counted from `rcm.json` lap deletions & lockups | Sub-second lockups require OpenF1 telemetry | 🟡 **High** |
| **DRIVER-06** | *Who is consistently strongest in Sector 1?* | 🟢 **YES** | `SectorMatrix.jsx` sector breakdown | — | 🟡 **High** |
| **DRIVER-07** | *Which driver improves the most over a stint?* | 🟢 **YES** | Stint pace slope analysis | — | 🟢 **Medium** |
| **DRIVER-08** | *Which driver destroys tyres fastest?* | 🟢 **YES** | Deg slope delta vs teammate on same compound | — | 🟡 **High** |

---

## 🤖 3. Evidence-Backed Explanation Layer (Signature Platform Differentiator)

> *"Instead of exposing raw metrics, answer the questions viewers naturally ask with evidence-backed explanations."*

| ID | Question | Status | How `f1-insights` Answers via AI | Output Format | Value |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **AI-01** | *Explain why Driver X is fast.* | 🟢 **YES** | Synthesizes S1/S2/S3 telemetry + braking point + corner speed | 4-Field Evidence Brief | 🔥 **Signature** |
| **AI-02** | *Explain why Ferrari is struggling.* | 🟢 **YES** | Correlates tyre degradation + high-speed corner speed loss | Diagnostic Narrative Card | 🔥 **Signature** |
| **AI-03** | *Summarize qualifying in three bullet points.* | 🟢 **YES** | Automated 3-bullet executive summary | Executive Bullet Brief | 🔥 **Signature** |
| **AI-04** | *What are the 3 biggest stories before the race?* | 🟢 **YES** | Synthesizes Grid Penalties + Upgrades + Weather Forecast | Pre-Race Briefing Card | 🔥 **Signature** |
| **AI-05** | *Who is the dark horse today?* | 🟢 **YES** | Finds driver out of position with top-4 race pace | Dark Horse Spotlight Card | 🟡 **High** |
| **AI-06** | *What should I watch on Lap 1?* | 🟢 **YES** | Identifies out-of-position rivals starting side-by-side | Lap 1 Watchlist | 🟡 **High** |
| **AI-07** | *Explain the likely winning strategy.* | 🟢 **YES** | Explains 1-stop vs 2-stop tyre cliff & pit window | Strategy Narrative Brief | 🔥 **Signature** |
| **AI-08** | *If I only watch the final 15 laps, what should I know?* | 🟢 **YES** | 30-second catch-up summary card | Catch-up Modal | 🔥 **Signature** |
| **AI-09** | *Who has traffic-filtered clear-air pace?* | 🟢 **YES** | Detects driver trapped in traffic with clear-air pace estimate | Traffic-Filtered Pace Alert | 🟡 **High** |
| **AI-10** | *Who is likely to surprise everyone?* | 🟢 **YES** | Correlates long-run FP2 pace vs low qualifying rank | Surprise Candidate | 🟡 **High** |
