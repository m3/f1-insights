import pytest
import sys
import os

# Ensure data_pipeline is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_pipeline")))

from analytics.telemetry import F1AnalyticsEngine

def test_penalty_watch_filtering():
    """Verify drivers with penalty points >= 8 are flagged at risk when live penalty data exists."""
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

def test_non_fabrication_rule_for_empty_data():
    """Verify empty/pending structures when no TracingInsights reader is configured."""
    engine = F1AnalyticsEngine()  # No tracing_reader

    # Sector matrix returns empty without TracingInsights
    sectors = engine.generate_sector_matrix()
    assert sectors == []

    # Grid penalties returns empty without TracingInsights
    penalties = engine.generate_grid_penalties()
    assert penalties["startingGridImpacts"] == []
    assert penalties["inRaceTimePenalties"] == []

    # Telemetry traces returns pending without TracingInsights
    traces = engine.generate_telemetry_traces()
    assert traces["status"] == "pending"
    assert traces["traceData"] == []

    # Post-race facts returns empty when no results exist
    post_facts = engine.generate_post_race_facts({"raceName": "Hungarian Grand Prix"})
    assert post_facts == []

def test_post_race_facts_with_live_results():
    """Verify post-race facts extracted strictly from live race results."""
    engine = F1AnalyticsEngine()
    mock_results = [
        {"Driver": {"givenName": "Andrea Kimi", "familyName": "Antonelli"}, "FastestLap": {"rank": "1", "Time": {"time": "1:18.420"}}}
    ]
    facts = engine.generate_post_race_facts({"raceName": "Hungarian Grand Prix"}, mock_results)
    assert len(facts) == 2
    assert facts[0]["stat"] == "P1: Andrea Kimi Antonelli"
    assert facts[1]["stat"] == "1:18.420"

def test_tracing_reader_sector_matrix():
    """Verify TracingInsights reader builds sector matrix from local data if available."""
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "tracing-insights"))
    if not os.path.isdir(data_dir):
        pytest.skip("TracingInsights data not cloned locally")

    from fetchers.tracing_reader import TracingInsightsReader
    reader = TracingInsightsReader(data_dir)
    races = reader.get_available_races()
    assert len(races) > 0, "No races found in TracingInsights data"

    # Test with first available race that has Qualifying data
    for race in races:
        sessions = reader.get_available_sessions(race)
        if "Qualifying" in sessions:
            matrix = reader.build_sector_matrix(race)
            if matrix:
                assert "code" in matrix[0]
                assert "s1" in matrix[0]
                assert "lapTime" in matrix[0]
                print(f"Sector matrix for {race}: {len(matrix)} drivers, pole: {matrix[0]['code']} {matrix[0]['lapTime']}")
                break

def test_data_pipeline_main_import_and_execution():
    """Verify data_pipeline/main.py can be imported and executed without syntax or import errors."""
    from main import run_pipeline
    # Run social mode update to verify pipeline execution end-to-end
    run_pipeline("social")

def test_strategic_position_index_calculation():
    """Verify Strategic Position Index composite calculation and score bounds."""
    engine = F1AnalyticsEngine()
    spi = engine.calculate_strategic_position_index(
        driver_code="NOR",
        tyre_age_delta=4.0,
        clean_air_gap_seconds=3.5,
        pit_window_safety_seconds=12.0,
        stint_deg_slope=0.08
    )

    assert spi["driver"] == "NOR"
    assert 0.0 <= spi["strategicPositionIndex"] <= 100.0
    assert spi["confidence"] == "HIGH"
    assert spi["breakdown"]["cleanAirScore"] == 70.0
    assert "formula" in spi

