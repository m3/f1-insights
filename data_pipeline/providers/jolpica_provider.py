"""
Jolpica Provider for F1 Insights HQ (v4.0 Specification).
Maintained Ergast-compatible API ingestion for 2026 schedule, standings, and race results.
"""
import httpx
import asyncio
import logging
from typing import Dict, List, Any, Optional
from .base_provider import BaseProvider, ProviderResponse

logger = logging.getLogger("JolpicaProvider")
JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"

# Shared plain httpx client — no HTTP cache, no keep-alive. The worker polls
# every 5 min and needs fresh results (sprint/race/qualifying get corrected
# post-session). Jolpica's Cloudflare serves stale edge-cached values on
# reused keep-alive connections, so open a fresh connection per request.
_SESSION = httpx.AsyncClient(
    headers={"User-Agent": "F1-Insights-Brief/4.0"},
    timeout=10.0,
    limits=httpx.Limits(max_keepalive_connections=0, max_connections=10),
)

class JolpicaProvider(BaseProvider):
    def __init__(self):
        super().__init__(provider_name="JolpicaErgast", cache_ttl_seconds=300)
        self.session = _SESSION

    async def fetch_schedule(self, season: str = "current") -> ProviderResponse:
        """Fetch 2026 race calendar."""
        url = f"{JOLPICA_BASE}/{season}.json"
        try:
            res = await self.session.get(url, timeout=10.0)
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

    async def fetch_driver_standings(self, season: str = "current") -> ProviderResponse:
        """Fetch Driver Championship Standings."""
        url = f"{JOLPICA_BASE}/{season}/driverStandings.json"
        try:
            res = await self.session.get(url, timeout=10.0)
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

    async def fetch_constructor_standings(self, season: str = "current") -> ProviderResponse:
        """Fetch Constructor Championship Standings."""
        url = f"{JOLPICA_BASE}/{season}/constructorStandings.json"
        try:
            res = await self.session.get(url, timeout=10.0)
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

    async def fetch_race_results(self, season: str = "current") -> ProviderResponse:
        """Fetch completed race results for active season."""
        url = f"{JOLPICA_BASE}/{season}/results.json?limit=500"
        try:
            res = await self.session.get(url, timeout=10.0)
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

    async def fetch_sprint_results(self, season: str = "current") -> ProviderResponse:
        """Fetch sprint race results for the current round (empty list on standard weekends)."""
        url = f"{JOLPICA_BASE}/{season}/sprint.json"
        try:
            res = await self.session.get(url, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
                sprint_results = races[0].get("SprintResults", []) if races else []
                return ProviderResponse(
                    data=sprint_results,
                    source="JolpicaErgast",
                    confidence=1.0,
                    status="available"
                )
        except Exception as e:
            logger.warning(f"Jolpica sprint results fetch error: {e}")

        return ProviderResponse(
            data=[],
            source="JolpicaErgast",
            confidence=0.0,
            status="failed",
            error_class="ProviderUnavailable"
        )

    async def fetch_qualifying_results(self, season: str = "current") -> ProviderResponse:
        """Fetch main qualifying results for the current round (empty until published)."""
        url = f"{JOLPICA_BASE}/{season}/qualifying.json"
        try:
            res = await self.session.get(url, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
                qualifying_results = races[0].get("QualifyingResults", []) if races else []
                return ProviderResponse(
                    data=qualifying_results,
                    source="JolpicaErgast",
                    confidence=1.0,
                    status="available"
                )
        except Exception as e:
            logger.warning(f"Jolpica qualifying results fetch error: {e}")

        return ProviderResponse(
            data=[],
            source="JolpicaErgast",
            confidence=0.0,
            status="failed",
            error_class="ProviderUnavailable"
        )
