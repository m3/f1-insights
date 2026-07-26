"""
Base Provider Abstraction Layer for F1 Insights HQ (v4.0 Specification).
Enforces schema versioning, provenance metadata, error taxonomy, and confidence scoring.
"""
from typing import Any, Dict, Optional
from datetime import datetime
import logging

logger = logging.getLogger("F1Providers")

class ProviderResponse:
    def __init__(
        self,
        data: Any,
        source: str,
        confidence: float = 1.0,
        status: str = "available",
        event: Optional[str] = None,
        is_synthetic: bool = False,
        stale: bool = False,
        error_class: Optional[str] = None
    ):
        self.schema_version = "4.0"
        self.data = data
        self.source = source
        self.confidence = confidence
        self.status = status  # 'pending', 'available', 'processing', 'partial', 'stale', 'failed'
        self.timestamp = datetime.utcnow().isoformat() + "Z"
        self.event = event
        self.is_synthetic = is_synthetic
        self.stale = stale
        self.error_class = error_class

    def to_dict(self) -> Dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "data": self.data,
            "provenance": {
                "source": self.source,
                "confidence": self.confidence,
                "status": self.status,
                "timestamp": self.timestamp,
                "event": self.event,
                "is_synthetic": self.is_synthetic,
                "stale": self.stale,
                "error_class": self.error_class
            }
        }

class BaseProvider:
    def __init__(self, provider_name: str, cache_ttl_seconds: int = 600):
        self.provider_name = provider_name
        self.cache_ttl_seconds = cache_ttl_seconds

    def fetch(self, *args, **kwargs) -> ProviderResponse:
        raise NotImplementedError("Subclasses must implement the fetch method")
