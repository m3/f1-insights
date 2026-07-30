"""
Unit tests for data_pipeline/analytics/duckdb_engine.py (F1 Insights v2026.10).
Proves DuckDB in-memory columnar telemetry loading and fast corner minimum speed queries.
"""
import pytest
from data_pipeline.analytics.duckdb_engine import DuckDBAnalyticsEngine

def test_duckdb_analytics_engine_queries():
    """Verify DuckDB in-memory columnar telemetry sample aggregation."""
    engine = DuckDBAnalyticsEngine(in_memory=True)
    if not engine.enabled:
        pytest.skip("DuckDB not installed locally")

    mock_samples = [
        {"driver_code": "NOR", "lap_number": 12, "distance_meters": 450.0, "speed_kmh": 142.5, "gear": 3, "throttle_pct": 0.0, "brake": 1},
        {"driver_code": "NOR", "lap_number": 12, "distance_meters": 480.0, "speed_kmh": 138.0, "gear": 3, "throttle_pct": 20.0, "brake": 0},
        {"driver_code": "VER", "lap_number": 12, "distance_meters": 450.0, "speed_kmh": 145.0, "gear": 3, "throttle_pct": 0.0, "brake": 1},
        {"driver_code": "VER", "lap_number": 12, "distance_meters": 480.0, "speed_kmh": 141.2, "gear": 3, "throttle_pct": 25.0, "brake": 0}
    ]

    engine.load_telemetry_samples(mock_samples)
    res = engine.query_corner_minimum_speed(["NOR", "VER"], min_distance=400.0, max_distance=500.0)

    assert len(res) == 2
    # VER minimum speed = 141.2, NOR minimum speed = 138.0
    assert res[0]["driver"] == "VER"
    assert res[0]["minSpeedKmh"] == 141.2
    assert res[1]["driver"] == "NOR"
    assert res[1]["minSpeedKmh"] == 138.0
