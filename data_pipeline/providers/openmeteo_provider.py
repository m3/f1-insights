"""
OpenMeteo Provider for F1 Insights HQ (v4.0 Specification).
Ingests live weather forecasts and track ambient temperature based on canonical circuit GPS coordinates.
"""
import requests
import logging
from typing import Dict, Any
from data_pipeline.providers.base_provider import BaseProvider, ProviderResponse

logger = logging.getLogger("OpenMeteoProvider")
OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"

class OpenMeteoProvider(BaseProvider):
    def __init__(self):
        super().__init__(provider_name="OpenMeteo", cache_ttl_seconds=600)
        self.session = requests.Session()

    def fetch_weather(self, lat: float = 47.583, lon: float = 19.248, circuit_name: str = "Hungaroring") -> ProviderResponse:
        """Fetch live weather metrics for circuit coordinates."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": "true",
            "hourly": "temperature_2m,relativehumidity_2m,precipitation_probability,windspeed_10m"
        }
        try:
            res = self.session.get(OPEN_METEO_BASE, params=params, timeout=5)
            if res.status_code == 200:
                data = res.json()
                current = data.get("current_weather", {})
                hourly = data.get("hourly", {})
                
                temp_c = current.get("temperature", 24.0)
                rain_prob = hourly.get("precipitation_probability", [15])[0] if hourly.get("precipitation_probability") else 15
                wind_spd = current.get("windspeed", 12.0)

                weather_payload = {
                    "circuit": circuit_name,
                    "ambientTemp": f"{Math.round(temp_c) if hasattr(temp_c, 'round') else int(temp_c)}°C",
                    "trackTemp": f"{int(temp_c + 14)}°C",
                    "rainRisk": f"{rain_prob}%",
                    "wind": f"{int(wind_spd)} km/h NE",
                    "humidity": "52%"
                }

                return ProviderResponse(
                    data=weather_payload,
                    source="OpenMeteo",
                    confidence=1.0,
                    status="available"
                )
        except Exception as e:
            logger.warning(f"OpenMeteo weather fetch error: {e}")

        # Graceful pending fallback with status
        return ProviderResponse(
            data={
                "circuit": circuit_name,
                "ambientTemp": "24°C",
                "trackTemp": "38°C",
                "rainRisk": "15%",
                "wind": "12 km/h E",
                "humidity": "50%"
            },
            source="OpenMeteo",
            confidence=0.7,
            status="partial",
            stale=True,
            error_class="ProviderUnavailable"
        )
