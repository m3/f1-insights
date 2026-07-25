import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_pipeline")))

from analytics.sentiment import F1SentimentEngine

def test_sentiment_entities_loader():
    """Verify entities configuration loads valid schema v2026.3."""
    entities = F1SentimentEngine.load_monitored_entities()
    assert entities.get("version") == "2026.3"
    assert "official_accounts" in entities
    assert "journalists_and_analysts" in entities
    assert "youtube_sources" in entities
    assert "keywords" in entities

def test_youtube_sources_in_summary():
    """Verify race sentiment summary includes YouTube watchalong channels."""
    summary = F1SentimentEngine.get_race_sentiment_summary("Hungarian Grand Prix")
    assert summary["overallSentiment"] == "HIGHLY HYPED"
    assert "youtubeSources" in summary
    assert len(summary["youtubeSources"]) > 0
    channel_names = [yt["channel_name"] for yt in summary["youtubeSources"]]
    assert "F1 Gamer" in channel_names
