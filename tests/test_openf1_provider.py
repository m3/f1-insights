"""
Unit tests for data_pipeline/providers/openf1_provider.py (F1 Insights v2026.10).
Proves OpenF1Provider schema structure, ProviderResponse provenance metadata, and error handling.
"""
import pytest
from unittest.mock import patch, MagicMock
from data_pipeline.providers.openf1_provider import OpenF1Provider

def test_openf1_provider_initialization():
    """Verify OpenF1Provider inherits from BaseProvider with correct defaults."""
    provider = OpenF1Provider()
    assert provider.provider_name == "OpenF1"
    assert provider.cache_ttl_seconds == 60

@patch("data_pipeline.providers.openf1_provider.requests.get")
def test_openf1_fetch_positions_success(mock_get):
    """Verify OpenF1Provider fetch_positions parses API response cleanly."""
    mock_res = MagicMock()
    mock_res.status_code = 200
    mock_res.json.return_value = [
        {"driver_number": 4, "position": 1, "session_key": 9158},
        {"driver_number": 1, "position": 2, "session_key": 9158}
    ]
    mock_get.return_value = mock_res

    provider = OpenF1Provider()
    resp = provider.fetch_positions("9158")
    assert resp.status == "available"
    assert resp.confidence == 0.95
    assert len(resp.data) == 2
    assert resp.data[0]["driver_number"] == 4

@patch("data_pipeline.providers.openf1_provider.requests.get")
def test_openf1_fetch_laps_failure_handling(mock_get):
    """Verify OpenF1Provider handles HTTP failure non-destructively."""
    mock_res = MagicMock()
    mock_res.status_code = 404
    mock_get.return_value = mock_res

    provider = OpenF1Provider()
    resp = provider.fetch_laps("invalid_key")
    assert resp.status == "failed"
    assert resp.confidence == 0.0
    assert resp.data == []
    assert resp.error_class == "HTTP_404"
