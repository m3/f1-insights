import pytest
import sys
import os

# Ensure data_pipeline is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_pipeline")))

from analytics.telemetry import F1AnalyticsEngine

def test_penalty_watch_filtering():
    """Verify drivers with penalty points >= 8 are flagged at risk."""
    engine = F1AnalyticsEngine()
    mock_penalty_data = [
        {"driver": "Kevin Magnussen", "code": "MAG", "points": 10, "expiry_next": "2026-09-01"},
        {"driver": "Lance Stroll", "code": "STR", "points": 8, "expiry_next": "2026-10-15"},
        {"driver": "Lando Norris", "code": "NOR", "points": 2, "expiry_next": "2026-11-01"}
    ]

    watch = engine.get_penalty_watch(mock_penalty_data)
    assert watch["total_drivers_flagged"] == 2
    flagged_codes = [d["code"] for d in watch["high_risk_drivers"]]
    assert "MAG" in flagged_codes
    assert "STR" in flagged_codes
    assert "NOR" not in flagged_codes

def test_teammate_battles_summary():
    """Verify teammate head-to-head battle calculations."""
    engine = F1AnalyticsEngine()
    battles = engine.get_teammate_battle_summary()
    assert isinstance(battles, list)
    assert len(battles) >= 4
    mclaren = next((b for b in battles if b["team"] == "McLaren"), None)
    assert mclaren is not None
    assert "NOR" in mclaren["drivers"]

def test_telemetry_trace_generation():
    """Verify telemetry trace coordinates are non-empty."""
    engine = F1AnalyticsEngine()
    traces = engine.generate_telemetry_traces()
    assert "traceData" in traces
    assert len(traces["traceData"]) > 0
    assert "NOR_speed" in traces["traceData"][0]
