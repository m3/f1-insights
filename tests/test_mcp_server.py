import pytest
import json
import sys
import os
from fastapi.testclient import TestClient

# Ensure backend and mcp_server are in path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(base_dir, "backend"))
sys.path.insert(0, os.path.join(base_dir, "mcp_server"))

from app.main import app
from mcp_server.main import (
    get_f1_overview,
    compare_corner_telemetry,
    get_fia_penalty_watch,
    get_trackside_media_sentiment,
    calculate_pit_strategy_loss,
    generate_morning_briefing
)

client = TestClient(app)

def test_mcp_get_f1_overview():
    """Verify get_f1_overview tool returns valid versioned 4.0 overview response."""
    res = get_f1_overview()
    data = json.loads(res)
    assert data["schema_version"] == "4.0"
    assert data["status"] == "ok"
    assert "data" in data

def test_mcp_compare_corner_telemetry():
    """Verify compare_corner_telemetry tool returns versioned telemetry comparison."""
    res = compare_corner_telemetry("NOR", "VER")
    data = json.loads(res)
    assert data["schema_version"] == "4.0"
    assert data["data"]["driver1"] == "NOR"
    assert data["data"]["driver2"] == "VER"

def test_mcp_get_fia_penalty_watch():
    """Verify get_fia_penalty_watch tool returns flagged drivers with provenance."""
    res = get_fia_penalty_watch()
    data = json.loads(res)
    assert data["schema_version"] == "4.0"
    assert "high_risk_drivers" in data["data"]

def test_mcp_get_trackside_media_sentiment():
    """Verify get_trackside_media_sentiment tool returns media feed with provenance."""
    res = get_trackside_media_sentiment()
    data = json.loads(res)
    assert data["schema_version"] == "4.0"

def test_mcp_calculate_pit_strategy_loss():
    """Verify calculate_pit_strategy_loss tool under Green and VSC conditions with schema version 4.0."""
    res_green = calculate_pit_strategy_loss(18.5, "green")
    data_green = json.loads(res_green)
    assert data_green["schema_version"] == "4.0"
    assert data_green["data"]["emerges_ahead"] is False
    assert data_green["data"]["net_delta_seconds"] == -3.3

    res_vsc = calculate_pit_strategy_loss(18.5, "vsc")
    data_vsc = json.loads(res_vsc)
    assert data_vsc["schema_version"] == "4.0"
    assert data_vsc["data"]["emerges_ahead"] is True
    assert data_vsc["data"]["net_delta_seconds"] == 5.0

def test_mcp_generate_morning_briefing():
    """Verify generate_morning_briefing tool returns versioned 4.0 briefing."""
    res = generate_morning_briefing("PRE_RACE")
    data = json.loads(res)
    assert data["schema_version"] == "4.0"

def test_mcp_remote_sse_security():
    """Verify remote MCP endpoints reject unauthenticated requests and allow valid X-API-Key requests."""
    res_unauth = client.post("/api/v1/mcp/tools/get_f1_overview")
    assert res_unauth.status_code == 401

    res_auth = client.post(
        "/api/v1/mcp/tools/get_f1_overview",
        headers={"X-API-Key": "f1-insights-admin-secret-key-2026"}
    )
    assert res_auth.status_code == 200
    assert res_auth.json()["status"] == "success"
