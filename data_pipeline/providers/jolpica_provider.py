"""
Jolpica Provider for F1 Insights HQ (v4.0 Specification).
Maintained Ergast-compatible API ingestion for 2026 schedule, standings, and race results.
"""
import httpx
import logging
from typing import Dict, List, Any, Optional
from .base_provider import BaseProvider, ProviderResponse

logger = logging.getLogger("JolpicaProvider")
JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"

class JolpicaProvider(BaseProvider):
    def __init__(self):
        super().__init__(provider_name="JolpicaErgast", cache_ttl_seconds=86400)
        self.session = httpx.Client(
            headers={"User-Agent": "F1-Insights-Brief/4.0"}
        )

    def fetch_schedule(self, season: str = "current") -> ProviderResponse:
        """Fetch 2026 race calendar."""
        url = f"{JOLPICA_BASE}/{season}.json"
        try:
            res = self.session.get(url, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
                return ProviderResponse(
                    data=races,
                    source="JolpicaErgast",
                    confidence=1.0,
                    status="available"
                )
        except Exception as e:
            logger.warning(f"Jolpica schedule fetch error: {e}")
            return ProviderResponse(
                data=[],
                source="JolpicaErgast",
                confidence=0.0,
                status="failed",
                error_class="ProviderUnavailable"
            )

    def fetch_driver_standings(self, season: str = "current") -> ProviderResponse:
        """Fetch Driver Championship Standings."""
        url = f"{JOLPICA_BASE}/{season}/driverStandings.json"
        try:
            res = self.session.get(url, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
                if lists:
                    standings = lists[0].get("DriverStandings", [])
                    return ProviderResponse(
                        data=standings,
                        source="JolpicaErgast",
                        confidence=1.0,
                        status="available"
                    )
        except Exception as e:
            logger.warning(f"Jolpica driver standings fetch error: {e}")

        return ProviderResponse(
            data=[],
            source="JolpicaErgast",
            confidence=0.0,
            status="failed",
            error_class="ProviderUnavailable"
        )

    def fetch_constructor_standings(self, season: str = "current") -> ProviderResponse:
        """Fetch Constructor Championship Standings."""
        url = f"{JOLPICA_BASE}/{season}/constructorStandings.json"
        try:
            res = self.session.get(url, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
                if lists:
                    standings = lists[0].get("ConstructorStandings", [])
                    return ProviderResponse(
                        data=standings,
                        source="JolpicaErgast",
                        confidence=1.0,
                        status="available"
                    )
        except Exception as e:
            logger.warning(f"Jolpica constructor standings fetch error: {e}")

        return ProviderResponse(
            data=[],
            source="JolpicaErgast",
            confidence=0.0,
            status="failed",
            error_class="ProviderUnavailable"
        )

    def fetch_race_results(self, season: str = "current") -> ProviderResponse:
        """Fetch completed race results for active season."""
        url = f"{JOLPICA_BASE}/{season}/results.json?limit=500"
        try:
            res = self.session.get(url, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
                return ProviderResponse(
                    data=races,
                    source="JolpicaErgast",
                    confidence=1.0,
                    status="available"
                )
        except Exception as e:
            logger.warning(f"Jolpica race results fetch error: {e}")

        return ProviderResponse(
            data=[],
            source="JolpicaErgast",
            confidence=0.0,
            status="failed",
            error_class="ProviderUnavailable"
        )
