import os

path = '/Users/mathias/Development/Projects/f1-insights/data_pipeline/fetchers/tracing_insights.py'
with open(path, 'r') as f:
    content = f.read()

# Add os import
content = content.replace(
    'import requests\nimport json',
    'import os\nimport requests\nimport json'
)

# Add cache directory and methods
init_code = """CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cache")

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
        return []"""

content = content.replace(
    'class F1DataFetcher:\n    def __init__(self):\n        self.session = requests.Session()\n        self.session.headers.update({"User-Agent": "F1-Insights-Brief/1.0"})',
    init_code
)

# Update get_current_schedule
old_schedule = """    def get_current_schedule(self, season: str = "current") -> List[Dict[str, Any]]:
        \"\"\"Fetch race calendar for the specified or current season.\"\"\"
        url = f"{JOLPICA_BASE}/{season}.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        except Exception as e:
            logger.warning(f"Failed to fetch live schedule: {e}. Falling back to default 2026 calendar.")
        
        return self._get_fallback_schedule()"""

new_schedule = """    def get_current_schedule(self, season: str = "current") -> List[Dict[str, Any]]:
        \"\"\"Fetch race calendar for the specified or current season.\"\"\"
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
        
        return self._load_cache('schedule.json')"""
content = content.replace(old_schedule, new_schedule)

# Update get_driver_standings
old_driver = """    def get_driver_standings(self, season: str = "current") -> List[Dict[str, Any]]:
        \"\"\"Fetch current Driver Championship Standings.\"\"\"
        url = f"{JOLPICA_BASE}/{season}/driverStandings.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
                if lists:
                    return lists[0].get("DriverStandings", [])
        except Exception as e:
            logger.warning(f"Failed to fetch driver standings: {e}")
        
        return []"""

new_driver = """    def get_driver_standings(self, season: str = "current") -> List[Dict[str, Any]]:
        \"\"\"Fetch current Driver Championship Standings.\"\"\"
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
        
        return self.get_fallback_driver_standings()"""
content = content.replace(old_driver, new_driver)

# Update get_constructor_standings
old_constructor = """    def get_constructor_standings(self, season: str = "current") -> List[Dict[str, Any]]:
        \"\"\"Fetch current Constructor Championship Standings.\"\"\"
        url = f"{JOLPICA_BASE}/{season}/constructorStandings.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
                if lists:
                    return lists[0].get("ConstructorStandings", [])
        except Exception as e:
            logger.warning(f"Failed to fetch constructor standings: {e}")
        
        return []"""

new_constructor = """    def get_constructor_standings(self, season: str = "current") -> List[Dict[str, Any]]:
        \"\"\"Fetch current Constructor Championship Standings.\"\"\"
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
        
        return self.get_fallback_constructor_standings()"""
content = content.replace(old_constructor, new_constructor)

# Replace _get_fallback_schedule with new fallback methods
fallback_index = content.find('    def _get_fallback_schedule(self)')
if fallback_index != -1:
    content = content[:fallback_index] + """    def get_fallback_driver_standings(self) -> List[Dict[str, Any]]:
        return self._load_cache('driver_standings.json')

    def get_fallback_constructor_standings(self) -> List[Dict[str, Any]]:
        return self._load_cache('constructor_standings.json')
"""

with open(path, 'w') as f:
    f.write(content)

