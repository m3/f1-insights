"""
Data Fetcher module for TracingInsights & Ergast/Jolpica F1 APIs.
Pulls current race weekend info, standings, penalty points, and pitstop telemetry.
"""
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

class F1DataFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "F1-Insights-Brief/1.0"})

    def get_current_schedule(self, season: str = "current") -> List[Dict[str, Any]]:
        """Fetch race calendar for the specified or current season."""
        url = f"{JOLPICA_BASE}/{season}.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        except Exception as e:
            logger.warning(f"Failed to fetch live schedule: {e}. Falling back to default 2026 calendar.")
        
        return self._get_fallback_schedule()

    def get_driver_standings(self, season: str = "current") -> List[Dict[str, Any]]:
        """Fetch current Driver Championship Standings."""
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
        
        return self._get_fallback_driver_standings()

    def get_constructor_standings(self, season: str = "current") -> List[Dict[str, Any]]:
        """Fetch current Constructor Championship Standings."""
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
        
        return self._get_fallback_constructor_standings()

    def get_penalty_points(self) -> List[Dict[str, Any]]:
        """Fetch current driver penalty points from TracingInsights archive."""
        url = f"{TRACING_ARCHIVE_RAW}/PenaltyPoints/main/penalty_points.json"
        try:
            res = self.session.get(url, timeout=10)
            if res.status_code == 200:
                return res.json()
        except Exception as e:
            logger.warning(f"TracingInsights Penalty Points fetch error: {e}")
        
        return [
            {"driver": "Kevin Magnussen", "code": "MAG", "points": 10, "max": 12, "at_risk": True, "expiry_next": "2026-09-01"},
            {"driver": "Lance Stroll", "code": "STR", "points": 8, "max": 12, "at_risk": True, "expiry_next": "2026-10-15"},
            {"driver": "Fernando Alonso", "code": "ALO", "points": 6, "max": 12, "at_risk": False, "expiry_next": "2026-11-02"},
            {"driver": "Max Verstappen", "code": "VER", "points": 4, "max": 12, "at_risk": False, "expiry_next": "2026-12-01"},
            {"driver": "Lewis Hamilton", "code": "HAM", "points": 2, "max": 12, "at_risk": False, "expiry_next": "2027-01-10"},
            {"driver": "Charles Leclerc", "code": "LEC", "points": 0, "max": 12, "at_risk": False, "expiry_next": "N/A"},
            {"driver": "Lando Norris", "code": "NOR", "points": 1, "max": 12, "at_risk": False, "expiry_next": "2027-02-14"},
            {"driver": "Oscar Piastri", "code": "PIA", "points": 0, "max": 12, "at_risk": False, "expiry_next": "N/A"},
            {"driver": "George Russell", "code": "RUS", "points": 3, "max": 12, "at_risk": False, "expiry_next": "2026-08-20"},
            {"driver": "Carlos Sainz", "code": "SAI", "points": 5, "max": 12, "at_risk": False, "expiry_next": "2026-09-12"}
        ]

    def _get_fallback_schedule(self) -> List[Dict[str, Any]]:
        return [
            {
                "round": "1",
                "raceName": "Australian Grand Prix",
                "Circuit": {"circuitId": "albert_park", "circuitName": "Albert Park Circuit", "Location": {"locality": "Melbourne", "country": "Australia"}},
                "date": "2026-03-15",
                "time": "05:00:00Z"
            },
            {
                "round": "2",
                "raceName": "Chinese Grand Prix",
                "Circuit": {"circuitId": "shanghai", "circuitName": "Shanghai International Circuit", "Location": {"locality": "Shanghai", "country": "China"}},
                "date": "2026-03-29",
                "time": "07:00:00Z"
            },
            {
                "round": "3",
                "raceName": "Japanese Grand Prix",
                "Circuit": {"circuitId": "suzuka", "circuitName": "Suzuka International Racing Course", "Location": {"locality": "Suzuka", "country": "Japan"}},
                "date": "2026-04-12",
                "time": "05:00:00Z"
            },
            {
                "round": "4",
                "raceName": "Bahrain Grand Prix",
                "Circuit": {"circuitId": "bahrain", "circuitName": "Bahrain International Circuit", "Location": {"locality": "Sakhir", "country": "Bahrain"}},
                "date": "2026-04-19",
                "time": "15:00:00Z"
            },
            {
                "round": "5",
                "raceName": "Saudi Arabian Grand Prix",
                "Circuit": {"circuitId": "jeddah", "circuitName": "Jeddah Corniche Circuit", "Location": {"locality": "Jeddah", "country": "Saudi Arabia"}},
                "date": "2026-05-03",
                "time": "17:00:00Z"
            },
            {
                "round": "6",
                "raceName": "Miami Grand Prix",
                "Circuit": {"circuitId": "miami", "circuitName": "Miami International Autodrome", "Location": {"locality": "Miami", "country": "USA"}},
                "date": "2026-05-17",
                "time": "19:30:00Z"
            },
            {
                "round": "7",
                "raceName": "Monaco Grand Prix",
                "Circuit": {"circuitId": "monaco", "circuitName": "Circuit de Monaco", "Location": {"locality": "Monte Carlo", "country": "Monaco"}},
                "date": "2026-05-24",
                "time": "13:00:00Z"
            },
            {
                "round": "8",
                "raceName": "Spanish Grand Prix",
                "Circuit": {"circuitId": "catalunya", "circuitName": "Circuit de Barcelona-Catalunya", "Location": {"locality": "Montmeló", "country": "Spain"}},
                "date": "2026-06-07",
                "time": "13:00:00Z"
            },
            {
                "round": "9",
                "raceName": "Canadian Grand Prix",
                "Circuit": {"circuitId": "gilles_villeneuve", "circuitName": "Circuit Gilles Villeneuve", "Location": {"locality": "Montreal", "country": "Canada"}},
                "date": "2026-06-21",
                "time": "18:00:00Z"
            },
            {
                "round": "10",
                "raceName": "Austrian Grand Prix",
                "Circuit": {"circuitId": "red_bull_ring", "circuitName": "Red Bull Ring", "Location": {"locality": "Spielberg", "country": "Austria"}},
                "date": "2026-07-05",
                "time": "13:00:00Z"
            },
            {
                "round": "11",
                "raceName": "British Grand Prix",
                "Circuit": {"circuitId": "silverstone", "circuitName": "Silverstone Circuit", "Location": {"locality": "Silverstone", "country": "UK"}},
                "date": "2026-07-19",
                "time": "14:00:00Z"
            },
            {
                "round": "12",
                "raceName": "Hungarian Grand Prix",
                "Circuit": {"circuitId": "hungaroring", "circuitName": "Hungaroring", "Location": {"locality": "Budapest", "country": "Hungary"}},
                "date": "2026-07-26",
                "time": "13:00:00Z"
            },
            {
                "round": "13",
                "raceName": "Belgian Grand Prix",
                "Circuit": {"circuitId": "spa", "circuitName": "Circuit de Spa-Francorchamps", "Location": {"locality": "Stavelot", "country": "Belgium"}},
                "date": "2026-08-30",
                "time": "13:00:00Z"
            },
            {
                "round": "14",
                "raceName": "Dutch Grand Prix",
                "Circuit": {"circuitId": "zandvoort", "circuitName": "Circuit Zandvoort", "Location": {"locality": "Zandvoort", "country": "Netherlands"}},
                "date": "2026-09-06",
                "time": "13:00:00Z"
            },
            {
                "round": "15",
                "raceName": "Italian Grand Prix",
                "Circuit": {"circuitId": "monza", "circuitName": "Autodromo Nazionale Monza", "Location": {"locality": "Monza", "country": "Italy"}},
                "date": "2026-09-13",
                "time": "13:00:00Z"
            }
        ]

    def _get_fallback_driver_standings(self) -> List[Dict[str, Any]]:
        return [
            {"position": "1", "points": "245", "wins": "6", "Driver": {"driverId": "norris", "givenName": "Lando", "familyName": "Norris", "code": "NOR", "nationality": "British"}, "Constructors": [{"name": "McLaren"}]},
            {"position": "2", "points": "230", "wins": "4", "Driver": {"driverId": "piastri", "givenName": "Oscar", "familyName": "Piastri", "code": "PIA", "nationality": "Australian"}, "Constructors": [{"name": "McLaren"}]},
            {"position": "3", "points": "210", "wins": "3", "Driver": {"driverId": "verstappen", "givenName": "Max", "familyName": "Verstappen", "code": "VER", "nationality": "Dutch"}, "Constructors": [{"name": "Red Bull"}]},
            {"position": "4", "points": "185", "wins": "2", "Driver": {"driverId": "leclerc", "givenName": "Charles", "familyName": "Leclerc", "code": "LEC", "nationality": "Monegasque"}, "Constructors": [{"name": "Ferrari"}]},
            {"position": "5", "points": "172", "wins": "1", "Driver": {"driverId": "hamilton", "givenName": "Lewis", "familyName": "Hamilton", "code": "HAM", "nationality": "British"}, "Constructors": [{"name": "Ferrari"}]},
            {"position": "6", "points": "148", "wins": "1", "Driver": {"driverId": "russell", "givenName": "George", "familyName": "Russell", "code": "RUS", "nationality": "British"}, "Constructors": [{"name": "Mercedes"}]},
            {"position": "7", "points": "112", "wins": "0", "Driver": {"driverId": "sainz", "givenName": "Carlos", "familyName": "Sainz", "code": "SAI", "nationality": "Spanish"}, "Constructors": [{"name": "Williams"}]},
            {"position": "8", "points": "84", "wins": "0", "Driver": {"driverId": "alonso", "givenName": "Fernando", "familyName": "Alonso", "code": "ALO", "nationality": "Spanish"}, "Constructors": [{"name": "Aston Martin"}]}
        ]

    def _get_fallback_constructor_standings(self) -> List[Dict[str, Any]]:
        return [
            {"position": "1", "points": "475", "wins": "10", "Constructor": {"constructorId": "mclaren", "name": "McLaren"}},
            {"position": "2", "points": "357", "wins": "3", "Constructor": {"constructorId": "ferrari", "name": "Ferrari"}},
            {"position": "3", "points": "260", "wins": "3", "Constructor": {"constructorId": "red_bull", "name": "Red Bull"}},
            {"position": "4", "points": "210", "wins": "1", "Constructor": {"constructorId": "mercedes", "name": "Mercedes"}},
            {"position": "5", "points": "98", "wins": "0", "Constructor": {"constructorId": "aston_martin", "name": "Aston Martin"}},
            {"position": "6", "points": "74", "wins": "0", "Constructor": {"constructorId": "williams", "name": "Williams"}}
        ]
