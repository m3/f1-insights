"""
Data Fetcher module for TracingInsights & Ergast/Jolpica F1 APIs.
Pulls current race weekend info, standings, penalty points, and pitstop telemetry.
"""
import os
import requests
import json
import logging
from typing import Dict, List, Any, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("F1DataFetcher")

# Base URLs
JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"
TRACING_INSIGHTS_RAW = "https://raw.githubusercontent.com/TracingInsights"
TRACING_ARCHIVE_RAW = "https://raw.githubusercontent.com/TracingInsights-Archive"

CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cache")

class F1DataFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "F1-Insights-Brief/1.0"})
        os.makedirs(CACHE_DIR, exist_ok=True)

    def _save_cache(self, filename: str, data: Any):
        try:
            with open(os.path.join(CACHE_DIR, filename), 'w') as f:
                json.dump(data, f)
        except Exception as e:
            logger.warning(f"Failed to save cache {filename}: {e}")

    def _load_cache(self, filename: str) -> Any:
        try:
            path = os.path.join(CACHE_DIR, filename)
            if os.path.exists(path):
                with open(path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load cache {filename}: {e}")
        return []

    def get_current_schedule(self, season: str = "current") -> List[Dict[str, Any]]:
        """Fetch race calendar for the specified or current season."""
        url = f"{JOLPICA_BASE}/{season}.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
                if races:
                    self._save_cache('schedule.json', races)
                return races
        except Exception as e:
            logger.warning(f"Failed to fetch live schedule: {e}. Falling back to local cache.")
        
        return self._load_cache('schedule.json')

    def get_driver_standings(self, season: str = "current") -> List[Dict[str, Any]]:
        """Fetch current Driver Championship Standings."""
        url = f"{JOLPICA_BASE}/{season}/driverStandings.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
                if lists:
                    standings = lists[0].get("DriverStandings", [])
                    self._save_cache('driver_standings.json', standings)
                    return standings
        except Exception as e:
            logger.warning(f"Failed to fetch driver standings: {e}")
        
        return self.get_fallback_driver_standings()

    def get_active_driver_codes(self, season: str = "current") -> set:
        """Fetch list of verified active driver codes for the active season to guard against stale data leakage."""
        standings = self.get_driver_standings(season)
        active_codes = set()
        for item in standings:
            driver = item.get("Driver", {})
            code = driver.get("code")
            if code:
                active_codes.add(code.upper())
        return active_codes

    def get_constructor_standings(self, season: str = "current") -> List[Dict[str, Any]]:
        """Fetch current Constructor Championship Standings."""
        url = f"{JOLPICA_BASE}/{season}/constructorStandings.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
                if lists:
                    standings = lists[0].get("ConstructorStandings", [])
                    self._save_cache('constructor_standings.json', standings)
                    return standings
        except Exception as e:
            logger.warning(f"Failed to fetch constructor standings: {e}")
        
        return self.get_fallback_constructor_standings()

    def get_penalty_points(self) -> List[Dict[str, Any]]:
        """Fetch current driver penalty points from TracingInsights archive, strictly filtered by active drivers."""
        active_codes = self.get_active_driver_codes()
        raw_list = []
        url = f"{TRACING_ARCHIVE_RAW}/PenaltyPoints/main/penalty_points.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                raw_list = res.json()
        except Exception as e:
            logger.warning(f"TracingInsights Penalty Points fetch error: {e}")
        
        # GUARDRAIL: Filter out any driver not in the active 2026 standings
        if active_codes and raw_list:
            filtered = [item for item in raw_list if item.get("code", "").upper() in active_codes]
            return filtered if filtered else raw_list
        return raw_list

    def get_fallback_driver_standings(self) -> List[Dict[str, Any]]:
        return self._load_cache('driver_standings.json')

    def get_fallback_constructor_standings(self) -> List[Dict[str, Any]]:
        return self._load_cache('constructor_standings.json')
