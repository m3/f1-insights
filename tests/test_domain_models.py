"""
Unit tests for data_pipeline/domain/models.py (F1 Insights v2026.10).
Proves strongly-typed Pydantic schemas and graph traversal helper methods.
"""
import pytest
from data_pipeline.domain.models import DomainSector, DomainLap, DomainStint, DomainDriver

def test_domain_lap_clear_air_filtering():
    """Prove that clear-air filtering correctly excludes traffic (<1.0s) and SC/pit laps."""
    lap_traffic = DomainLap(
        lap_number=10,
        lap_time_seconds=84.5,
        compound="MEDIUM",
        stint_number=1,
        gap_to_car_ahead_seconds=0.6,
        is_pit_out_lap=False,
        is_pit_in_lap=False,
        is_safety_car_lap=False
    )
    lap_clear = DomainLap(
        lap_number=11,
        lap_time_seconds=83.8,
        compound="MEDIUM",
        stint_number=1,
        gap_to_car_ahead_seconds=2.4,
        is_pit_out_lap=False,
        is_pit_in_lap=False,
        is_safety_car_lap=False
    )
    lap_sc = DomainLap(
        lap_number=12,
        lap_time_seconds=115.0,
        compound="MEDIUM",
        stint_number=1,
        gap_to_car_ahead_seconds=3.0,
        is_safety_car_lap=True
    )

    assert lap_traffic.is_clear_air(min_gap=1.0) is False
    assert lap_clear.is_clear_air(min_gap=1.0) is True
    assert lap_sc.is_clear_air(min_gap=1.0) is False

def test_domain_stint_degradation_slope():
    """Prove that stint degradation slope computation yields correct slope delta."""
    laps = [
        DomainLap(lap_number=1, lap_time_seconds=80.0, compound="MEDIUM", stint_number=1, gap_to_car_ahead_seconds=2.0),
        DomainLap(lap_number=2, lap_time_seconds=80.2, compound="MEDIUM", stint_number=1, gap_to_car_ahead_seconds=2.5),
        DomainLap(lap_number=3, lap_time_seconds=80.6, compound="MEDIUM", stint_number=1, gap_to_car_ahead_seconds=3.0)
    ]
    stint = DomainStint(
        stint_number=1,
        compound="MEDIUM",
        start_lap=1,
        end_lap=3,
        total_laps=3,
        laps=laps
    )

    assert len(stint.get_clear_air_laps()) == 3
    assert pytest.approx(stint.compute_degradation_slope(), 0.01) == 0.30

def test_domain_driver_graph_traversal():
    """Prove driver entity total laps completion graph traversal."""
    stint1 = DomainStint(stint_number=1, compound="MEDIUM", start_lap=1, end_lap=15, total_laps=15, laps=[])
    stint2 = DomainStint(stint_number=2, compound="HARD", start_lap=16, end_lap=45, total_laps=30, laps=[])
    driver = DomainDriver(
        driver_id="norris",
        code="NOR",
        number=1,
        given_name="Lando",
        family_name="Norris",
        team_name="McLaren",
        stints=[stint1, stint2]
    )

    assert driver.get_total_laps_completed() == 45
