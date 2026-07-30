"""
Unit tests for data_pipeline/analytics/strategy_forecaster.py (F1 Insights v2026.10).
Proves StrategyForecaster green-flag lap decay extrapolation and Safety Car pit window cushion forecasting.
"""
import pytest
from data_pipeline.analytics.strategy_forecaster import StrategyForecaster

def test_forecast_green_flag_outcome():
    """Verify green flag race outcome extrapolation and overtake lap calculation."""
    driver_a = {"code": "NOR", "gapToCarBehindSeconds": 4.0, "meanPaceSeconds": 81.0, "degSlopePerLap": 0.10} # Fast deg
    driver_b = {"code": "VER", "gapToCarBehindSeconds": 0.0, "meanPaceSeconds": 80.0, "degSlopePerLap": 0.01} # Low deg
    
    res = StrategyForecaster.forecast_green_flag_outcome(driver_a, driver_b, laps_remaining=15)
    assert res["predictedWinner"] == "VER"
    assert res["predictedOvertakeLap"] is not None
    assert res["projectedMarginSeconds"] > 0

def test_forecast_safety_car_beneficiaries():
    """Verify Safety Car pit time savings calculation for drivers yet to pit."""
    drivers = [
        {"code": "NOR", "position": 1, "hasPitted": True},
        {"code": "VER", "position": 2, "hasPitted": False},
        {"code": "PIA", "position": 3, "hasPitted": False}
    ]
    res = StrategyForecaster.forecast_safety_car_beneficiaries(drivers, normal_pit_loss_seconds=21.5, sc_pit_loss_seconds=11.2)
    assert len(res["beneficiaries"]) == 2
    b_codes = [b["driver"] for b in res["beneficiaries"]]
    assert "VER" in b_codes
    assert "PIA" in b_codes
    assert "NOR" not in b_codes
    assert res["scPitTimeSavedSeconds"] == 10.3
