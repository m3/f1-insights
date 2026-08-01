import pytest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_pipeline")))
from fetchers.tracing_reader import TracingInsightsReader

@pytest.fixture
def reader():
    return TracingInsightsReader(data_dir="/fake/dir")

def test_get_available_races(reader):
    with patch('os.path.isdir', return_value=True), \
         patch('os.listdir', return_value=[".github", "Hungarian Grand Prix", "cache", "Dutch Grand Prix"]):
        races = reader.get_available_races()
        assert len(races) == 2
        assert "Hungarian Grand Prix" in races
        assert "Dutch Grand Prix" in races

def test_build_sector_matrix_success(reader):
    def mock_load_json(*args):
        filename = args[-1]
        if filename == "drivers.json":
            return {"drivers": [{"driver": "NOR", "fn": "Lando", "ln": "Norris", "team": "McLaren", "tc": "FF8700"}]}
        elif filename == "laptimes.json":
            return {
                "time": [80.123, 75.500],
                "s1": [25.1, 24.8],
                "s2": [28.2, 27.9],
                "s3": [26.8, 22.8],
                "vst": [310, 312]
            }
        return None

    with patch.object(reader, 'get_driver_codes', return_value=["NOR"]), \
         patch.object(reader, '_load_json', side_effect=mock_load_json):
        
        matrix = reader.build_sector_matrix("Hungarian Grand Prix")
        assert len(matrix) == 1
        assert matrix[0]["code"] == "NOR"
        assert matrix[0]["team"] == "McLaren"
        assert matrix[0]["lapTimeSeconds"] == 75.500
        assert matrix[0]["s1Best"] is True

def test_build_grid_penalties_parsing(reader):
    def mock_load_json(*args):
        return {
            "cat": ["Other", "Other"],
            "msg": ["CAR 4 (NOR) - 5 SECOND TIME PENALTY", "CAR 1 (VER) - 3 PLACE GRID PENALTY"],
            "flag": ["None", "None"],
            "lap": [14, 0],
            "dNum": [4, 1],
            "time": ["15:10", "16:00"]
        }

    with patch.object(reader, '_load_json', side_effect=mock_load_json):
        penalties = reader.build_grid_penalties("Hungarian Grand Prix")
        assert len(penalties["inRaceTimePenalties"]) == 1
        assert len(penalties["startingGridImpacts"]) == 1
        assert "TIME PENALTY" in penalties["inRaceTimePenalties"][0]["message"].upper()
        assert "GRID PENALTY" in penalties["startingGridImpacts"][0]["message"].upper()

def test_build_tyre_deg_data_filtering(reader):
    """Ensure outliers like out-laps and safety cars are filtered out."""
    def mock_load_json(*args):
        return {
            "time": [100.1, 80.5, 130.0], # 130 is an outlier
            "compound": ["MEDIUM", "MEDIUM", "MEDIUM"],
            "stint": [1, 1, 1],
            "life": [1, 2, 3],
            "lap": [1, 2, 3],
            "pin": [None, None, None],
            "pout": ["True", None, None] # Out-lap
        }

    with patch.object(reader, '_load_json', side_effect=mock_load_json):
        deg_data = reader.build_tyre_deg_data("Hungarian Grand Prix", "NOR")
        # Lap 1 is filtered because pout is not None.
        # Lap 3 is filtered because time > 120.
        assert len(deg_data) == 1
        assert deg_data[0]["lap"] == 2
        assert deg_data[0]["lapTime"] == 80.5
