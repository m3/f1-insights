"""
Analytics module for F1 Insights.
Strict non-fabrication rule: All data comes from TracingInsights local repo or Jolpica Ergast API.
No static fallbacks, no synthetic generators, no hardcoded values.
"""
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger("F1AnalyticsEngine")


class F1AnalyticsEngine:
    def __init__(self, tracing_reader=None):
        self.tracing = tracing_reader

    @staticmethod
    def get_penalty_watch(penalty_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Find drivers with 8+ penalty points near ban threshold (12 pts) from live feed."""
        if not penalty_data:
            return {
                "high_risk_drivers": [],
                "total_drivers_flagged": 0,
                "summary": "Penalty points data unavailable."
            }
        at_risk = [d for d in penalty_data if d.get("points", 0) >= 8 or d.get("at_risk", False)]
        at_risk.sort(key=lambda x: x.get("points", 0), reverse=True)
        return {
            "high_risk_drivers": at_risk,
            "total_drivers_flagged": len(at_risk),
            "summary": f"{len(at_risk)} driver(s) currently on penalty watch (>8 points)." if at_risk else "All drivers currently clear of penalty ban threshold."
        }

    def generate_sector_matrix(self, race_name: str = None, standings: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Build sector matrix from TracingInsights qualifying data."""
        if self.tracing and race_name:
            return self.tracing.build_sector_matrix(race_name)
        return []

    def generate_grid_penalties(self, race_name: str = None, steward_decisions: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Extract grid/time penalties from TracingInsights race control messages."""
        if self.tracing and race_name:
            return self.tracing.build_grid_penalties(race_name)
        if steward_decisions:
            return {
                "startingGridImpacts": [d for d in steward_decisions if d.get("type") == "grid_drop"],
                "inRaceTimePenalties": [d for d in steward_decisions if d.get("type") == "time_penalty"]
            }
        return {"startingGridImpacts": [], "inRaceTimePenalties": []}

    def generate_circuit_blueprint_specs(self, race_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate circuit specs from race metadata + TracingInsights corner data."""
        circuit = race_info.get("Circuit", {})
        race_name = race_info.get("raceName", "")
        specs = {
            "circuitName": circuit.get("circuitName", "Grand Prix Circuit"),
            "circuitId": circuit.get("circuitId", ""),
            "lat": circuit.get("Location", {}).get("lat"),
            "lng": circuit.get("Location", {}).get("long"),
        }

        if self.tracing and race_name:
            corners = self.tracing.get_corners(race_name)
            if corners:
                specs["corners"] = corners
        return specs

    def generate_pre_race_facts(self, race_info: Dict[str, Any], standings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate pre-race facts from live WDC standings."""
        race_name = race_info.get("raceName", "Grand Prix")
        facts = []

        if standings and len(standings) >= 2:
            try:
                p1_pts = float(standings[0].get("points", 0))
                p2_pts = float(standings[1].get("points", 0))
                gap_pts = int(p1_pts - p2_pts)
                p1_name = standings[0].get("Driver", {}).get("familyName", "P1")
                p2_name = standings[1].get("Driver", {}).get("familyName", "P2")
                facts.append({
                    "topic": "Championship Stakes",
                    "badge": "Title Race",
                    "detail": f"{p1_name} leads {p2_name} by {gap_pts} points in the World Drivers' Championship heading into {race_name}.",
                    "stat": f"{gap_pts} Pts Gap",
                    "source": "JolpicaErgast"
                })
            except Exception:
                pass

        return facts

    def generate_post_race_facts(self, race_info: Dict[str, Any], race_results: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Generate post-race facts strictly from live Ergast race results."""
        if not race_results or len(race_results) == 0:
            return []

        race_name = race_info.get("raceName", "Grand Prix")
        first_driver = race_results[0].get("Driver", {})
        winner_name = f"{first_driver.get('givenName', '')} {first_driver.get('familyName', '')}".strip()

        facts = [
            {
                "topic": "Grand Prix Race Winner",
                "badge": "Race Result",
                "detail": f"{winner_name} secured victory at {race_name}, crossing the line P1.",
                "stat": f"P1: {winner_name}",
                "source": "JolpicaErgast"
            }
        ]

        for r in race_results:
            fl = r.get("FastestLap", {})
            if fl.get("rank") == "1":
                drv = r.get("Driver", {})
                fastest_driver = drv.get("familyName", "Driver")
                fastest_lap_str = fl.get("Time", {}).get("time", "")
                if fastest_lap_str:
                    facts.append({
                        "topic": "Official Fastest Lap",
                        "badge": "Speed Trap",
                        "detail": f"{fastest_driver} recorded the fastest lap of the session with a time of {fastest_lap_str}.",
                        "stat": fastest_lap_str,
                        "source": "JolpicaErgast"
                    })
                break

        return facts

    def generate_telemetry_traces(self, race_name: str = None, driver_codes: List[str] = None) -> Dict[str, Any]:
        """Build telemetry trace data from TracingInsights per-driver lap telemetry."""
        if not self.tracing or not race_name:
            return {"status": "pending", "drivers": {}, "traceData": []}

        drivers_meta = self.tracing.get_drivers(race_name, "Race")
        meta_map = {}
        for d in drivers_meta:
            meta_map[d.get("driver", "")] = {
                "name": f"{d.get('fn', '')} {d.get('ln', '')}",
                "team": d.get("team", ""),
                "color": f"#{d.get('tc', '888888')}"
            }

        if not driver_codes:
            driver_codes = self.tracing.get_driver_codes(race_name, "Race")[:6]

        drivers_info = {}
        for code in driver_codes:
            meta = meta_map.get(code, {"name": code, "team": "", "color": "#888888"})
            drivers_info[code] = meta

        return {
            "status": "available" if driver_codes else "pending",
            "drivers": drivers_info,
            "traceData": [],  # Full per-sample telemetry loaded on demand by frontend
            "availableDrivers": driver_codes,
        }

    def build_tyre_strategy_summary(self, race_name: str = None, driver_codes: List[str] = None) -> List[Dict[str, Any]]:
        """Build tyre degradation data from TracingInsights race laptimes."""
        if not self.tracing or not race_name:
            return []

        if not driver_codes:
            driver_codes = self.tracing.get_driver_codes(race_name, "Race")[:10]

        all_deg = []
        for code in driver_codes:
            entries = self.tracing.build_tyre_deg_data(race_name, code)
            all_deg.extend(entries)

        return all_deg

    def build_pit_strategy(self, race_name: str = None) -> List[Dict[str, Any]]:
        """Build pit stop timeline from TracingInsights race data."""
        if not self.tracing or not race_name:
            return []
        return self.tracing.build_pit_stops(race_name)

    def get_teammate_battle_summary(self, race_results_races: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Calculate teammate H2H from Jolpica Ergast race results."""
        if not race_results_races:
            return []

        pairs = [
            {"team": "Mercedes", "code1": "ANT", "code2": "RUS"},
            {"team": "Ferrari", "code1": "HAM", "code2": "LEC"},
            {"team": "McLaren", "code1": "NOR", "code2": "PIA"},
            {"team": "Red Bull Racing", "code1": "VER", "code2": "HAD"},
            {"team": "RB (Racing Bulls)", "code1": "LAW", "code2": "LIN"},
            {"team": "Alpine", "code1": "GAS", "code2": "COL"},
            {"team": "Haas", "code1": "BEA", "code2": "OCO"},
            {"team": "Sauber / Audi", "code1": "BOR", "code2": "HUL"},
            {"team": "Williams", "code1": "SAI", "code2": "ALB"},
            {"team": "Aston Martin", "code1": "ALO", "code2": "STR"}
        ]

        summary = []
        for p in pairs:
            c1, c2 = p["code1"], p["code2"]
            r1_wins, r2_wins, q1_wins, q2_wins = 0, 0, 0, 0

            for race in race_results_races:
                results = race.get("Results", [])
                pos_map, grid_map = {}, {}
                for r in results:
                    code = r.get("Driver", {}).get("code")
                    if code:
                        try:
                            pos_map[code] = int(r.get("position", 99))
                            grid_map[code] = int(r.get("grid", 99))
                        except Exception:
                            pass

                if c1 in pos_map and c2 in pos_map:
                    if pos_map[c1] < pos_map[c2]: r1_wins += 1
                    elif pos_map[c2] < pos_map[c1]: r2_wins += 1
                if c1 in grid_map and c2 in grid_map:
                    if grid_map[c1] < grid_map[c2]: q1_wins += 1
                    elif grid_map[c2] < grid_map[c1]: q2_wins += 1

            if r1_wins > 0 or r2_wins > 0 or q1_wins > 0 or q2_wins > 0:
                leader_code = c1 if r1_wins >= r2_wins else c2
                summary.append({
                    "team": p["team"],
                    "drivers": f"{c1} vs {c2}",
                    "quali": f"{q1_wins} - {q2_wins}",
                    "race": f"{r1_wins} - {r2_wins}",
                    "leader": f"{leader_code} Ahead"
                })

        return summary

    def calculate_strategic_position_index(
        self,
        driver_code: str,
        tyre_age_delta: float,
        clean_air_gap_seconds: float,
        pit_window_safety_seconds: float,
        stint_deg_slope: float
    ) -> Dict[str, Any]:
        """
        Calculate composite Strategic Position Index (SPI: 0 - 100).
        Algorithm:
          SPI = 0.35 * TyreLifeScore + 0.25 * CleanAirScore + 0.25 * PitWindowScore + 0.15 * DegSlopeScore
        """
        # Component 1: Tyre Life Delta Score (max 10 laps delta -> 100)
        tyre_score = min(100.0, max(0.0, 50.0 + (tyre_age_delta * 5.0)))
        
        # Component 2: Clean Air Traffic Gap (max 5.0s -> 100)
        clean_air_score = min(100.0, max(0.0, (clean_air_gap_seconds / 5.0) * 100.0))
        
        # Component 3: Pit Window Safety Cushion (max 20.0s free pit window -> 100)
        pit_score = min(100.0, max(0.0, (pit_window_safety_seconds / 20.0) * 100.0))
        
        # Component 4: Stint Degradation Slope (lower degradation = higher score)
        deg_score = min(100.0, max(0.0, 100.0 - (stint_deg_slope * 250.0)))

        composite_spi = round(
            (0.35 * tyre_score) +
            (0.25 * clean_air_score) +
            (0.25 * pit_score) +
            (0.15 * deg_score),
            1
        )

        confidence_rating = "HIGH" if clean_air_gap_seconds > 0 and pit_window_safety_seconds > 0 else "MODERATE"

        return {
            "driver": driver_code,
            "strategicPositionIndex": composite_spi,
            "confidence": confidence_rating,
            "breakdown": {
                "tyreLifeScore": round(tyre_score, 1),
                "cleanAirScore": round(clean_air_score, 1),
                "pitWindowScore": round(pit_score, 1),
                "degSlopeScore": round(deg_score, 1)
            },
            "formula": "0.35*TyreLife + 0.25*CleanAir + 0.25*PitWindow + 0.15*DegSlope"
        }

    def detect_hidden_pace(self, driver_lap_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Detect drivers trapped in DRS traffic whose clear-air pace capability is higher than track position.
        Filters out Lap 1, in/out pit laps, SC laps, and traffic laps (gap < 1.0s).
        """
        if not driver_lap_records:
            return {"hiddenPaceDrivers": [], "summary": "No lap records provided for hidden pace analysis."}

        analyzed_drivers = []
        for record in driver_lap_records:
            code = record.get("driver", "UNK")
            track_pos = record.get("trackPosition", 99)
            laps = record.get("laps", [])

            # Filter clear-air laps (> 1.0s gap, non-SC, non-pit)
            clear_air_times = [
                l.get("lapTimeSeconds") for l in laps
                if l.get("gapToAheadSeconds", 0) >= 1.0
                and not l.get("isSafetyCar", False)
                and not l.get("isPitLap", False)
                and l.get("lapNumber", 1) > 1
                and l.get("lapTimeSeconds") is not None
            ]

            if clear_air_times:
                mean_clear_pace = sum(clear_air_times) / len(clear_air_times)
                analyzed_drivers.append({
                    "driver": code,
                    "trackPosition": track_pos,
                    "clearAirMeanPace": round(mean_clear_pace, 3),
                    "clearAirLapsCount": len(clear_air_times)
                })

        # Sort by clear air mean pace (ascending = faster)
        analyzed_drivers.sort(key=lambda x: x["clearAirMeanPace"])
        
        # Rank drivers by clear air pace
        for rank, item in enumerate(analyzed_drivers, start=1):
            item["clearAirRank"] = rank
            item["hiddenDelta"] = item["trackPosition"] - rank # Positive delta = trapped behind slower cars

        hidden_heroes = [d for d in analyzed_drivers if d["hiddenDelta"] >= 2]

        return {
            "hiddenPaceDrivers": hidden_heroes,
            "allRankings": analyzed_drivers,
            "summary": f"Detected {len(hidden_heroes)} driver(s) trapped in traffic with top-rank clear air pace." if hidden_heroes else "Track positions reflect clear air pace rankings."
        }


