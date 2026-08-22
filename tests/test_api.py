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

def test_schema_contract():
    """Verify master overview endpoint conforms to v5.0 schema versioning and provenance contract."""
    response = client.get("/api/v1/overview")
    assert response.status_code == 200
    data = response.json()
    assert data.get("schema_version") == "5.0"
    assert "provenance" in data
    assert "sources" in data["provenance"]
    assert "JolpicaErgast" in data["provenance"]["sources"]

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
    assert "driver1" in data

def test_social_feed_endpoint():
    """Verify social media radar feed endpoint."""
    response = client.get("/api/v1/social/feed")
    assert response.status_code == 200

def test_admin_endpoint_requires_api_key():
    """Verify protected admin MCP tool endpoint requires valid API Key."""
    unauth = client.post("/api/v1/mcp/tools/get_f1_overview")
    assert unauth.status_code == 401

    auth = client.post(
        "/api/v1/mcp/tools/get_f1_overview",
        headers={"X-API-Key": "f1-insights-admin-secret-key-2026"}
    )
    assert auth.status_code == 200
    assert auth.json()["status"] == "success"

def test_production_security_validation():
    """Verify production environment startup rejects insecure default ADMIN_API_KEY."""
    from core.config import settings
    original_env = settings.ENVIRONMENT
    try:
        settings.ENVIRONMENT = "production"
        with pytest.raises(ValueError, match="CRITICAL: Insecure default ADMIN_API_KEY"):
            # Trigger lifespan logic
            from app.main import lifespan
            import asyncio
            async def run_check():
                async with lifespan(app):
                    pass
            asyncio.run(run_check())
    finally:
        settings.ENVIRONMENT = original_env

def test_admin_pipeline_trigger_endpoints():
    """Verify protected admin pipeline trigger endpoints enforce auth security."""
    unauth_full = client.post("/api/v1/admin/trigger-pipeline")
    assert unauth_full.status_code == 401

    unauth_social = client.post("/api/v1/admin/trigger-social")
    assert unauth_social.status_code == 401

    auth_social = client.post(
        "/api/v1/admin/trigger-social",
        headers={"X-API-Key": "f1-insights-admin-secret-key-2026"}
    )
    assert auth_social.status_code == 200
    assert auth_social.json()["status"] == "success"

def test_briefs_endpoints():
    """Verify morning briefing API endpoints."""
    res_latest = client.get("/api/v1/briefs/latest")
    assert res_latest.status_code in [200, 404]

def test_drivers_endpoints():
    """Verify driver penalty watch status API endpoint."""
    res_drivers = client.get("/api/v1/drivers/penalty-watch")
    assert res_drivers.status_code == 200
    assert isinstance(res_drivers.json(), list)
