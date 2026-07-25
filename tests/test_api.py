import pytest
import sys
import os
from fastapi.testclient import TestClient

# Ensure backend app is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    """Verify system health endpoint returns 200 and database connected status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["wal_mode"] is True

def test_master_overview_endpoint():
    """Verify master overview endpoint returns current race and standings data."""
    response = client.get("/api/v1/overview")
    assert response.status_code == 200
    data = response.json()
    assert "currentRace" in data
    assert "driverStandings" in data

def test_schedule_endpoints():
    """Verify schedule list and current race endpoints."""
    res_schedule = client.get("/api/v1/schedule/")
    assert res_schedule.status_code == 200
    assert isinstance(res_schedule.json(), list)

    res_current = client.get("/api/v1/schedule/current")
    assert res_current.status_code == 200

def test_standings_endpoints():
    """Verify WDC and WCC standings endpoints."""
    res_drivers = client.get("/api/v1/standings/drivers")
    assert res_drivers.status_code == 200
    assert isinstance(res_drivers.json(), list)

    res_teams = client.get("/api/v1/standings/constructors")
    assert res_teams.status_code == 200

def test_telemetry_compare_endpoint():
    """Verify telemetry comparison endpoint with driver codes."""
    response = client.get("/api/v1/telemetry/compare?driver1=NOR&driver2=VER")
    assert response.status_code == 200
    data = response.json()
    assert data["driver1"] == "NOR"
    assert data["driver2"] == "VER"
    assert "traceData" in data

def test_social_feed_endpoint():
    """Verify social & media feed endpoint."""
    response = client.get("/api/v1/social/feed")
    assert response.status_code == 200
    data = response.json()
    assert "overallSentiment" in data
    assert "youtubeSources" in data
