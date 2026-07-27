"""
TracingInsights Local Data Reader.
Reads session telemetry, lap times, race control messages, weather, and corner coordinates
directly from the cloned TracingInsights/2026 GitHub repository on the local filesystem.

Strict non-fabrication rule: If a file does not exist, returns empty structures.
"""
import os
import json
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger("TracingInsightsReader")

# Default data directory (relative to project root)
DEFAULT_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "tracing-insights")


class TracingInsightsReader:
    def __init__(self, data_dir: str = None):
        self.data_dir = data_dir or DEFAULT_DATA_DIR
        if not os.path.isdir(self.data_dir):
            logger.warning(f"TracingInsights data directory not found: {self.data_dir}")

    def _load_json(self, *path_parts) -> Optional[Any]:
        """Load a JSON file from the data directory. Returns None if file doesn't exist."""
        path = os.path.join(self.data_dir, *path_parts)
        if not os.path.isfile(path):
            return None
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Error reading {path}: {e}")
            return None

    def get_available_races(self) -> List[str]:
        """List all race directories that exist in the data repo."""
        if not os.path.isdir(self.data_dir):
            return []
        excluded = {".github", ".gitignore", "cache", "cache_preseason", "schemas"}
        return sorted([
            d for d in os.listdir(self.data_dir)
            if os.path.isdir(os.path.join(self.data_dir, d)) and d not in excluded
        ])

    def get_available_sessions(self, race_name: str) -> List[str]:
        """List all session directories for a race (Practice 1, Qualifying, Race, etc.)."""
        race_dir = os.path.join(self.data_dir, race_name)
        if not os.path.isdir(race_dir):
            return []
        return sorted([
            d for d in os.listdir(race_dir)
            if os.path.isdir(os.path.join(race_dir, d))
        ])

    def get_drivers(self, race_name: str, session: str = "Race") -> List[Dict[str, Any]]:
        """Load drivers.json for a session."""
        data = self._load_json(race_name, session, "drivers.json")
        if data and "drivers" in data:
            return data["drivers"]
        return []

    def get_driver_codes(self, race_name: str, session: str = "Race") -> List[str]:
        """Get list of driver codes that have telemetry data for a session."""
        session_dir = os.path.join(self.data_dir, race_name, session)
        if not os.path.isdir(session_dir):
            return []
        return sorted([
            d for d in os.listdir(session_dir)
            if os.path.isdir(os.path.join(session_dir, d)) and len(d) == 3 and d.isupper()
        ])

    def get_session_laptimes(self, race_name: str, session: str = "Race") -> Optional[Dict[str, Any]]:
        """Load aggregated session_laptimes.json for all drivers."""
        return self._load_json(race_name, session, "session_laptimes.json")

    def get_driver_laptimes(self, race_name: str, driver_code: str, session: str = "Race") -> Optional[Dict[str, Any]]:
        """Load per-driver laptimes.json."""
        return self._load_json(race_name, session, driver_code, "laptimes.json")

    def get_driver_lap_telemetry(self, race_name: str, driver_code: str, lap: int, session: str = "Race") -> Optional[Dict[str, Any]]:
        """Load per-driver per-lap telemetry ({lap}_tel.json)."""
        return self._load_json(race_name, session, driver_code, f"{lap}_tel.json")

    def get_race_control_messages(self, race_name: str, session: str = "Race") -> List[Dict[str, Any]]:
        """Load race control messages from rcm.json and return as list of structured dicts."""
        data = self._load_json(race_name, session, "rcm.json")
        if not data:
            return []
        cats = data.get("cat", [])
        msgs = data.get("msg", [])
        flags = data.get("flag", [])
        laps = data.get("lap", [])
        dnums = data.get("dNum", [])
        times = data.get("time", [])
        return [
            {
                "category": cats[i] if i < len(cats) else "",
                "message": msgs[i] if i < len(msgs) else "",
                "flag": flags[i] if i < len(flags) else None,
                "lap": laps[i] if i < len(laps) else None,
                "driverNumber": dnums[i] if i < len(dnums) else None,
                "time": times[i] if i < len(times) else None,
            }
            for i in range(len(cats))
        ]

    def get_corners(self, race_name: str, session: str = "Race") -> List[Dict[str, Any]]:
        """Load circuit corner coordinates from corners.json."""
        data = self._load_json(race_name, session, "corners.json")
        if not data:
            return []
        numbers = data.get("CornerNumber", [])
        xs = data.get("X", [])
        ys = data.get("Y", [])
        return [
            {"corner": numbers[i], "x": xs[i], "y": ys[i]}
            for i in range(len(numbers))
        ]

    def get_weather(self, race_name: str, session: str = "Race") -> List[Dict[str, Any]]:
        """Load session weather data from weather.json."""
        data = self._load_json(race_name, session, "weather.json")
        if not data:
            return []
        timestamps = data.get("wT", [])
        ambient = data.get("wAT", [])
        humidity = data.get("wH", [])
        pressure = data.get("wP", [])
        rain = data.get("wR", [])
        track_temp = data.get("wTT", [])
        wind_dir = data.get("wWD", [])
        wind_spd = data.get("wWS", [])
        return [
            {
                "timestamp": timestamps[i] if i < len(timestamps) else None,
                "ambientTemp": ambient[i] if i < len(ambient) else None,
                "humidity": humidity[i] if i < len(humidity) else None,
                "pressure": pressure[i] if i < len(pressure) else None,
                "rain": rain[i] if i < len(rain) else None,
                "trackTemp": track_temp[i] if i < len(track_temp) else None,
                "windDirection": wind_dir[i] if i < len(wind_dir) else None,
                "windSpeed": wind_spd[i] if i < len(wind_spd) else None,
            }
            for i in range(len(timestamps))
        ]

    # ------------------------------------------------------------------
    # High-level aggregation methods used by the analytics engine
    # ------------------------------------------------------------------

    def build_sector_matrix(self, race_name: str) -> List[Dict[str, Any]]:
        """
        Build sector performance matrix from Qualifying session data.
        Finds each driver's fastest Q lap and extracts s1, s2, s3, speed trap.
        """
        drivers_meta = self.get_drivers(race_name, "Qualifying")
        driver_codes = self.get_driver_codes(race_name, "Qualifying")
        if not driver_codes:
            return []

        # Build name/team lookup from drivers.json
        meta_map = {}
        for d in drivers_meta:
            meta_map[d.get("driver", "")] = {
                "name": f"{d.get('fn', '')} {d.get('ln', '')}",
                "team": d.get("team", ""),
                "color": f"#{d.get('tc', '888888')}"
            }

        results = []
        for code in driver_codes:
            lt = self.get_driver_laptimes(race_name, code, "Qualifying")
            if not lt:
                continue
            times = lt.get("time", [])
            s1_list = lt.get("s1", [])
            s2_list = lt.get("s2", [])
            s3_list = lt.get("s3", [])
            vst_list = lt.get("vst", [])

            # Find fastest valid lap
            valid = []
            for i, t in enumerate(times):
                if t not in ("None", None):
                    try:
                        valid.append((float(t), i))
                    except (ValueError, TypeError):
                        pass
            if not valid:
                continue

            fastest_time, idx = min(valid, key=lambda x: x[0])
            mins = int(fastest_time) // 60
            secs = fastest_time - mins * 60

            s1_val = s1_list[idx] if idx < len(s1_list) else None
            s2_val = s2_list[idx] if idx < len(s2_list) else None
            s3_val = s3_list[idx] if idx < len(s3_list) else None
            vst_val = vst_list[idx] if idx < len(vst_list) else None

            meta = meta_map.get(code, {"name": code, "team": "", "color": "#888888"})
            results.append({
                "code": code,
                "name": meta["name"],
                "team": meta["team"],
                "color": meta["color"],
                "s1": str(s1_val) if s1_val not in ("None", None) else None,
                "s2": str(s2_val) if s2_val not in ("None", None) else None,
                "s3": str(s3_val) if s3_val not in ("None", None) else None,
                "st": float(vst_val) if vst_val not in ("None", None) else None,
                "lapTime": f"{mins}:{secs:06.3f}",
                "lapTimeSeconds": fastest_time,
            })

        # Sort by lap time
        results.sort(key=lambda x: x["lapTimeSeconds"])

        # Mark best sector / speed trap
        if results:
            best_s1 = min((float(r["s1"]) for r in results if r["s1"]), default=None)
            best_s2 = min((float(r["s2"]) for r in results if r["s2"]), default=None)
            best_s3 = min((float(r["s3"]) for r in results if r["s3"]), default=None)
            best_st = max((r["st"] for r in results if r["st"]), default=None)

            for r in results:
                r["s1Best"] = r["s1"] is not None and float(r["s1"]) == best_s1
                r["s2Best"] = r["s2"] is not None and float(r["s2"]) == best_s2
                r["s3Best"] = r["s3"] is not None and float(r["s3"]) == best_s3
                r["stBest"] = r["st"] is not None and r["st"] == best_st

        return results

    def build_grid_penalties(self, race_name: str) -> Dict[str, Any]:
        """
        Extract grid penalties and time penalties from race control messages.
        Parses steward decisions from rcm.json.
        """
        msgs = self.get_race_control_messages(race_name, "Race")
        if not msgs:
            return {"startingGridImpacts": [], "inRaceTimePenalties": []}

        grid_penalties = []
        time_penalties = []
        for m in msgs:
            msg_text = m.get("message", "")
            msg_upper = msg_text.upper()

            # Detect time penalties (e.g. "TIME PENALTY", "5 SECOND", "10 SECOND")
            if "TIME PENALTY" in msg_upper or "SECOND TIME PENALTY" in msg_upper:
                time_penalties.append({
                    "message": msg_text,
                    "lap": m.get("lap"),
                    "category": m.get("category"),
                })

            # Detect grid penalties (e.g. "GRID PENALTY", "GRID PLACE PENALTY")
            if "GRID" in msg_upper and "PENALTY" in msg_upper:
                grid_penalties.append({
                    "message": msg_text,
                    "lap": m.get("lap"),
                    "category": m.get("category"),
                })

            # Detect track limits deletions
            if "LAP DELETED" in msg_upper and "TRACK LIMITS" in msg_upper:
                time_penalties.append({
                    "message": msg_text,
                    "lap": m.get("lap"),
                    "category": "Track Limits",
                })

            # Detect steward investigations and decisions
            if "FIA STEWARDS" in msg_upper:
                time_penalties.append({
                    "message": msg_text,
                    "lap": m.get("lap"),
                    "category": "Steward Decision",
                })

        return {
            "startingGridImpacts": grid_penalties,
            "inRaceTimePenalties": time_penalties,
        }

    def build_tyre_deg_data(self, race_name: str, driver_code: str) -> List[Dict[str, Any]]:
        """
        Build tyre degradation curve data from race laptimes.
        Groups laps by stint and compound, calculates deg rate.
        """
        lt = self.get_driver_laptimes(race_name, driver_code, "Race")
        if not lt:
            return []

        times = lt.get("time", [])
        compounds = lt.get("compound", [])
        stints = lt.get("stint", [])
        lives = lt.get("life", [])
        laps = lt.get("lap", [])
        pins = lt.get("pin", [])
        pouts = lt.get("pout", [])

        entries = []
        for i in range(len(times)):
            t = times[i]
            if t in ("None", None):
                continue
            try:
                lap_time = float(t)
            except (ValueError, TypeError):
                continue

            # Skip outlier laps (pit in/out, safety car, first lap)
            if laps[i] <= 1:
                continue
            if pins[i] not in ("None", None) or pouts[i] not in ("None", None):
                continue
            if lap_time > 120:  # likely safety car or issue
                continue

            entries.append({
                "lap": laps[i],
                "lapTime": lap_time,
                "compound": compounds[i] if i < len(compounds) else "UNKNOWN",
                "stint": stints[i] if i < len(stints) else 1,
                "tyreLife": lives[i] if i < len(lives) else 0,
                "driver": driver_code,
            })

        return entries

    def build_pit_stops(self, race_name: str) -> List[Dict[str, Any]]:
        """Extract pit stop data from all drivers' laptimes (pin/pout fields)."""
        driver_codes = self.get_driver_codes(race_name, "Race")
        pit_stops = []

        for code in driver_codes:
            lt = self.get_driver_laptimes(race_name, code, "Race")
            if not lt:
                continue

            laps = lt.get("lap", [])
            pins = lt.get("pin", [])
            pouts = lt.get("pout", [])
            compounds = lt.get("compound", [])

            for i in range(len(laps)):
                pin_val = pins[i] if i < len(pins) else None
                pout_val = pouts[i] if i < len(pouts) else None
                if pin_val not in ("None", None) or pout_val not in ("None", None):
                    pit_stops.append({
                        "driver": code,
                        "lap": laps[i],
                        "pitIn": pin_val if pin_val != "None" else None,
                        "pitOut": pout_val if pout_val != "None" else None,
                        "compoundAfter": compounds[i] if i < len(compounds) else None,
                    })

        pit_stops.sort(key=lambda x: (x["lap"], x["driver"]))
        return pit_stops

    def build_session_weather_summary(self, race_name: str, session: str = "Race") -> Dict[str, Any]:
        """Build weather summary from actual session weather data."""
        weather = self.get_weather(race_name, session)
        if not weather:
            return {}

        ambient_temps = [w["ambientTemp"] for w in weather if w["ambientTemp"] is not None]
        track_temps = [w["trackTemp"] for w in weather if w["trackTemp"] is not None]
        wind_speeds = [w["windSpeed"] for w in weather if w["windSpeed"] is not None]
        humidities = [w["humidity"] for w in weather if w["humidity"] is not None]
        rain_flags = [w["rain"] for w in weather if w["rain"] is not None]

        return {
            "ambientTemp": f"{round(sum(ambient_temps) / len(ambient_temps))}°C" if ambient_temps else "N/A",
            "trackTemp": f"{round(sum(track_temps) / len(track_temps))}°C" if track_temps else "N/A",
            "wind": f"{round(sum(wind_speeds) / len(wind_speeds), 1)} km/h" if wind_speeds else "N/A",
            "humidity": f"{round(sum(humidities) / len(humidities))}%" if humidities else "N/A",
            "rainDuringSession": any(rain_flags) if rain_flags else False,
            "samples": len(weather),
        }

    def get_latest_commit_sha(self) -> Optional[str]:
        """Read the HEAD commit SHA from the local clone."""
        head_file = os.path.join(self.data_dir, ".git", "refs", "heads", "main")
        if os.path.isfile(head_file):
            try:
                with open(head_file, "r") as f:
                    return f.read().strip()
            except Exception:
                pass
        # Try packed-refs
        packed = os.path.join(self.data_dir, ".git", "packed-refs")
        if os.path.isfile(packed):
            try:
                with open(packed, "r") as f:
                    for line in f:
                        if "refs/heads/main" in line:
                            return line.split()[0]
            except Exception:
                pass
        return None

    def pull_latest(self) -> bool:
        """Pull latest changes from TracingInsights remote."""
        import subprocess
        if not os.path.isdir(self.data_dir):
            return False
        try:
            result = subprocess.run(
                ["git", "pull", "--ff-only"],
                cwd=self.data_dir,
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                logger.info(f"TracingInsights data updated: {result.stdout.strip()}")
                return True
            else:
                logger.warning(f"git pull failed: {result.stderr}")
                return False
        except Exception as e:
            logger.warning(f"Error pulling TracingInsights data: {e}")
            return False
