"""
OpenF1 API Provider for F1 Insights Platform (v2026.10).
Ingests live car telemetry, gaps, track limits, and session positions from api.openf1.org.
"""
from typing import Dict, List, Any, Optional
import httpx
import hishel
import asyncio
import logging
from .base_provider import BaseProvider, ProviderResponse

logger = logging.getLogger("OpenF1Provider")

class OpenF1Provider(BaseProvider):
    BASE_URL = "https://api.openf1.org/v1"

    def __init__(self, cache_ttl_seconds: int = 60):
        super().__init__("OpenF1", cache_ttl_seconds)
        self.storage = hishel.AsyncSQLiteStorage(ttl=self.cache_ttl_seconds)
        self.session = hishel.AsyncCacheClient(storage=self.storage)

    async def fetch_car_data(self, session_key: str, driver_number: int) -> ProviderResponse:
        """Fetch telemetry sample records (speed, rpm, gear, throttle) for a driver."""
        url = f"{self.BASE_URL}/car_data?session_key={session_key}&driver_number={driver_number}"
        try:
            res = await self.session.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                return ProviderResponse(data=data, source="api.openf1.org/car_data", confidence=0.95, status="available")
            return ProviderResponse(data=[], source="api.openf1.org", confidence=0.0, status="failed", error_class=f"HTTP_{res.status_code}")
        except Exception as e:
            logger.warning(f"OpenF1 car_data request failed: {e}")
            return ProviderResponse(data=[], source="api.openf1.org", confidence=0.0, status="failed", error_class=str(type(e).__name__))

    async def fetch_positions(self, session_key: str) -> ProviderResponse:
        """Fetch live track position order for all drivers in session."""
        url = f"{self.BASE_URL}/position?session_key={session_key}"
        try:
            res = await self.session.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                return ProviderResponse(data=data, source="api.openf1.org/position", confidence=0.95, status="available")
            return ProviderResponse(data=[], source="api.openf1.org", confidence=0.0, status="failed", error_class=f"HTTP_{res.status_code}")
        except Exception as e:
            logger.warning(f"OpenF1 position request failed: {e}")
            return ProviderResponse(data=[], source="api.openf1.org", confidence=0.0, status="failed", error_class=str(type(e).__name__))

    async def fetch_laps(self, session_key: str) -> ProviderResponse:
        """Fetch lap duration split records for all drivers in session."""
        url = f"{self.BASE_URL}/laps?session_key={session_key}"
        try:
            res = await self.session.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                return ProviderResponse(data=data, source="api.openf1.org/laps", confidence=0.95, status="available")
            return ProviderResponse(data=[], source="api.openf1.org", confidence=0.0, status="failed", error_class=f"HTTP_{res.status_code}")
        except Exception as e:
            logger.warning(f"OpenF1 laps request failed: {e}")
            return ProviderResponse(data=[], source="api.openf1.org", confidence=0.0, status="failed", error_class=str(type(e).__name__))
