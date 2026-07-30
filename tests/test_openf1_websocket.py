"""
Unit tests for data_pipeline/providers/openf1_websocket.py (F1 Insights v2026.10).
Proves OpenF1WebSocketStreamer connection handshake, listener subscription, and exponential backoff reconnection.
"""
import pytest
import asyncio
from data_pipeline.providers.openf1_websocket import OpenF1WebSocketStreamer

@pytest.mark.asyncio
async def test_openf1_websocket_connection_handshake():
    """Verify WebSocket streamer connection handshake and listener event dispatching."""
    streamer = OpenF1WebSocketStreamer(session_key="9158")
    received_events = []

    def on_event(event):
        received_events.append(event)

    streamer.subscribe(on_event)
    await streamer.connect()

    assert streamer.is_connected is True
    assert len(received_events) == 1
    assert received_events[0]["event"] == "connection_established"
    assert received_events[0]["session_key"] == "9158"

def test_openf1_websocket_reconnection_backoff():
    """Verify exponential backoff reconnect attempt counter and max retry limit."""
    streamer = OpenF1WebSocketStreamer()
    for i in range(1, 6):
        can_reconnect = streamer.handle_reconnect()
        assert can_reconnect is True
        assert streamer.reconnect_attempts == i

    # 6th attempt exceeds max_reconnect_attempts (5)
    can_reconnect_6 = streamer.handle_reconnect()
    assert can_reconnect_6 is False
    assert streamer.is_connected is False
