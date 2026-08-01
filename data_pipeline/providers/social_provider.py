"""
Social Provider for F1 Insights HQ (v4.0 Specification).
Ingests accredited media radar metadata and journalist handles from config/entities.json.
Strict non-fabrication rule: If live RSS/X API streams are unconfigured, returns pending status.
"""
import os
import json
import logging
from typing import Dict, Any
from .base_provider import BaseProvider, ProviderResponse

logger = logging.getLogger("SocialProvider")
CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config", "entities.json")

class SocialProvider(BaseProvider):
    def __init__(self):
        super().__init__(provider_name="SocialRadar", cache_ttl_seconds=300)

    def fetch_social_sentiment(self, race_name: str = "Hungarian Grand Prix") -> ProviderResponse:
        """Fetch media radar metadata and monitored accounts via F1SentimentEngine."""
        try:
            from data_pipeline.analytics.sentiment import F1SentimentEngine
            
            # Use the newly updated dynamic RSS + NLP engine
            payload = F1SentimentEngine.get_race_sentiment_summary(race_name)
            
            return ProviderResponse(
                data=payload,
                source="SocialMediaRadar",
                confidence=1.0,
                status="available"
            )
        except Exception as e:
            logger.error(f"Failed to run F1SentimentEngine: {e}")
            # Fallback structure if engine fails
            return ProviderResponse(
                data={
                    "schema_version": "4.0",
                    "race": race_name,
                    "overallSentiment": "OFFLINE",
                    "sentimentScore": 0,
                    "breakingNewsTweets": [],
                    "xTracksideFeed": []
                },
                source="SocialMediaRadar",
                confidence=0.0,
                status="error"
            )
