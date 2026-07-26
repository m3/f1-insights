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
        {"driver": "Esteban Ocon", "code": "OCO", "points": 10, "expiry_next": "2026-09-01"},
        {"driver": "Lance Stroll", "code": "STR", "points": 8, "expiry_next": "2026-10-15"},
        {"driver": "Lando Norris", "code": "NOR", "points": 2, "expiry_next": "2026-11-01"}
    ]

    watch = engine.get_penalty_watch(mock_penalty_data)
    assert watch["total_drivers_flagged"] == 2
    flagged_codes = [d["code"] for d in watch["high_risk_drivers"]]
    assert "OCO" in flagged_codes
    assert "STR" in flagged_codes
    assert "NOR" not in flagged_codes

def test_physical_sanity_lap_times():
    """Verify lap times conform to physical F1 human & mechanical boundaries."""
    engine = F1AnalyticsEngine()
    sectors = engine.generate_sector_matrix()
    pole_driver = sectors[0]
    
    # Pole position lap must be realistic dry qualifying time (>= 1:15.000)
    lap_parts = pole_driver["lapTime"].split(":")
    lap_seconds = int(lap_parts[0]) * 60 + float(lap_parts[1])
    assert 75.0 <= lap_seconds <= 85.0, f"Pole lap time {pole_driver['lapTime']} violates dry qualifying physics boundary"

    post_facts = engine.generate_post_race_facts({"raceName": "Hungarian Grand Prix"})
    fastest_lap_fact = next(f for f in post_facts if f["topic"] == "Official Fastest Lap")
    fl_parts = fastest_lap_fact["stat"].split(":")
    fl_seconds = int(fl_parts[0]) * 60 + float(fl_parts[1])
    assert fl_seconds >= 76.627, "Race lap cannot violate all-time outright race lap record (1:16.627)"

def test_active_2026_driver_lineup_validation():
    """Verify grid penalties reference active 2026 drivers, excluding retired/replaced 2024 drivers."""
    engine = F1AnalyticsEngine()
    penalties = engine.generate_grid_penalties()
    grid_drops = penalties["startingGridImpacts"]
    
    active_2026_codes = {"VER", "STR", "GAS", "NOR", "BEA", "OCO", "HAM", "LEC", "RUS", "ANT", "SAI", "ALB"}
    for item in grid_drops:
        assert item["code"] in active_2026_codes, f"Driver {item['code']} is not an active 2026 driver"

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
