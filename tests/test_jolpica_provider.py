import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_pipeline")))
from providers.jolpica_provider import JolpicaProvider

@pytest.fixture
def provider():
    return JolpicaProvider()

@pytest.mark.asyncio
async def test_fetch_schedule_success(provider):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "MRData": {
            "RaceTable": {
                "Races": [{"raceName": "Hungarian Grand Prix"}]
            }
        }
    }
    
    with patch.object(provider.session, 'get', new_callable=AsyncMock, return_value=mock_response):
        res = await provider.fetch_schedule()
        
    assert res.status == "available"
    assert len(res.data) == 1
    assert res.data[0]["raceName"] == "Hungarian Grand Prix"
    assert res.confidence == 1.0

@pytest.mark.asyncio
async def test_fetch_schedule_schema_drift(provider):
    """Test resilience against upstream API changing their JSON schema."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    # Missing 'RaceTable' or 'Races'
    mock_response.json.return_value = {
        "MRData": {
            "SomeOtherTable": []
        }
    }
    
    with patch.object(provider.session, 'get', new_callable=AsyncMock, return_value=mock_response):
        res = await provider.fetch_schedule()
        
    assert res.status == "available"
    assert res.data == [] # Should safely fallback to empty list instead of crashing

@pytest.mark.asyncio
async def test_fetch_driver_standings_network_failure(provider):
    with patch.object(provider.session, 'get', new_callable=AsyncMock, side_effect=Exception("Connection Timeout")):
        res = await provider.fetch_driver_standings()
        
    assert res.status == "failed"
    assert res.data == []
    assert res.error_class == "ProviderUnavailable"
    assert res.confidence == 0.0

@pytest.mark.asyncio
async def test_fetch_constructor_standings_success(provider):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "MRData": {
            "StandingsTable": {
                "StandingsLists": [
                    {
                        "ConstructorStandings": [
                            {"position": "1", "Constructors": [{"name": "McLaren"}]}
                        ]
                    }
                ]
            }
        }
    }
    
    with patch.object(provider.session, 'get', new_callable=AsyncMock, return_value=mock_response):
        res = await provider.fetch_constructor_standings()
        
    assert res.status == "available"
    assert len(res.data) == 1
    assert res.data[0]["Constructors"][0]["name"] == "McLaren"
