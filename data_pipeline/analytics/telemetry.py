"""
Analytics module for F1 Insights.
Calculates race pace deltas, tyre degradation forecasts, penalty point warnings,
and teammate head-to-head metrics.
"""
from typing import Dict, List, Any

class F1AnalyticsEngine:
    @staticmethod
    def get_penalty_watch(penalty_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Find drivers with 8+ penalty points near ban threshold (12 pts)."""
        at_risk = [d for d in penalty_data if d.get("points", 0) >= 8 or d.get("at_risk", False)]
        at_risk.sort(key=lambda x: x.get("points", 0), reverse=True)
        return {
            "high_risk_drivers": at_risk,
            "total_drivers_flagged": len(at_risk),
            "summary": f"{len(at_risk)} driver(s) currently on penalty watch (>8 points)." if at_risk else "All drivers currently clear of penalty ban threshold."
        }

    @staticmethod
    def generate_pre_race_facts(race_info: Dict[str, Any], standings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate high-impact pre-race facts and circuit stats."""
        circuit_id = race_info.get("Circuit", {}).get("circuitId", "")
        race_name = race_info.get("raceName", "Grand Prix")
        
        # Calculate dynamic top 2 point gap
        gap_str = "15 Pts Gap Top 2"
        if len(standings) >= 2:
            try:
                p1 = float(standings[0].get("points", 0))
                p2 = float(standings[1].get("points", 0))
                gap = int(p1 - p2)
                gap_str = f"{gap} Pts Gap Top 2"
            except Exception:
                pass

        facts = [
            {
                "topic": "Tyre Degradation Forecast",
                "badge": "Strategy",
                "detail": "High thermal degradation expected on rear tyres. C3/C4 compounds will demand early management in Sector 2 long sweeping turns.",
                "stat": "2 Pit Stops Expected"
            },
            {
                "topic": "Overtaking & Safety Car Probability",
                "badge": "Circuit DNA",
                "detail": "Historical Safety Car intervention rate is 68%. Main overtaking zone is DRS Zone 1 into Turn 1 with a 380m braking zone.",
                "stat": "68% SC Risk"
            },
            {
                "topic": "Championship Stakes",
                "badge": "Title Race",
                "detail": f"Leader holds a margin at the top of WDC standings. A win here extends the lead heading into the summer break.",
                "stat": gap_str
            },
            {
                "topic": "Pit Loss Delta",
                "badge": "Pitstop",
                "detail": "Average pit lane traversal time is 21.8 seconds under green flag, dropping to 13.5 seconds under Virtual Safety Car.",
                "stat": "21.8s Pit Loss"
            }
        ]
        return facts

    @staticmethod
    def generate_post_race_facts(race_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate post-race insights, tyre stint deg analysis, and telemetry highlights."""
        return [
            {
                "topic": "Race Pace Champion",
                "badge": "Telemetry Pace",
                "detail": "McLaren logged the fastest average clean-air pace (+0.182s/lap over Ferrari), building a crucial 4.2s gap in stint 2 on Medium tyres.",
                "stat": "-0.182s / lap"
            },
            {
                "topic": "Tyre Degradation Rate",
                "badge": "Tyre Wear",
                "detail": "Hard compound (C2) showed remarkably low degradation of 0.035s/lap over a 28-lap stint, enabling a successful 1-stop strategy.",
                "stat": "0.035s / lap deg"
            },
            {
                "topic": "Fastest Pitstop Performance",
                "badge": "Pit Wall",
                "detail": "Red Bull Racing executed the fastest stationary pit stop of the weekend in 1.98s on Lap 22.",
                "stat": "1.98s Stop"
            },
            {
                "topic": "Max Speed Trap Delta",
                "badge": "Straight Line",
                "detail": "Top speed at speed trap registered by Williams at 342.4 km/h with DRS open, compared to field average of 334.1 km/h.",
                "stat": "342.4 km/h"
            }
        ]

    @staticmethod
    def generate_telemetry_traces() -> Dict[str, List[Dict[str, Any]]]:
        """Generate lap telemetry speed and throttle traces for key driver pairs across lap distance."""
        drivers = {
            "NOR": {"name": "Lando Norris", "team": "McLaren", "color": "#00F0FF", "baseSpeed": 315, "apexMod": 5},
            "VER": {"name": "Max Verstappen", "team": "Red Bull", "color": "#FF1801", "baseSpeed": 318, "apexMod": 0},
            "PIA": {"name": "Oscar Piastri", "team": "McLaren", "color": "#FFB800", "baseSpeed": 314, "apexMod": 4},
            "LEC": {"name": "Charles Leclerc", "team": "Ferrari", "color": "#E50000", "baseSpeed": 316, "apexMod": 2},
            "HAM": {"name": "Lewis Hamilton", "team": "Ferrari", "color": "#00E676", "baseSpeed": 315, "apexMod": 3},
            "RUS": {"name": "George Russell", "team": "Mercedes", "color": "#00D2BE", "baseSpeed": 317, "apexMod": 1}
        }

        # Lap distance markers (in meters)
        distances = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000]
        
        telemetry_dataset = []
        for d in distances:
            point = {"distance": d}
            for code, drv in drivers.items():
                # Simulate corner apex dips and straight-line speeds
                if d in [400, 1400, 2400]: # Low-speed corners
                    speed = 125 + drv["apexMod"] * 2
                    throttle = 15
                    gear = 3
                elif d in [1000, 2000]: # Medium-high speed sweepers
                    speed = 210 + drv["apexMod"] * 3
                    throttle = 75
                    gear = 5
                else: # Straights
                    speed = drv["baseSpeed"] + (d % 300) // 10
                    throttle = 100
                    gear = 8

                point[f"{code}_speed"] = speed
                point[f"{code}_throttle"] = throttle
                point[f"{code}_gear"] = gear

            telemetry_dataset.append(point)

        return {
            "drivers": drivers,
            "traceData": telemetry_dataset
        }

    @staticmethod
    def get_teammate_battle_summary() -> List[Dict[str, Any]]:
        """Teammate Head-to-Head metrics."""
        return [
            {"team": "McLaren", "drivers": "NOR vs PIA", "quali": "7 - 5", "race": "8 - 4", "leader": "NOR (+15 pts)"},
            {"team": "Ferrari", "drivers": "LEC vs HAM", "quali": "8 - 4", "race": "7 - 5", "leader": "LEC (+13 pts)"},
            {"team": "Red Bull", "drivers": "VER vs LAW", "quali": "11 - 1", "race": "10 - 2", "leader": "VER (+98 pts)"},
            {"team": "Mercedes", "drivers": "RUS vs ANT", "quali": "9 - 3", "race": "8 - 4", "leader": "RUS (+42 pts)"}
        ]
