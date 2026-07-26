import json
import os
import sys
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse

# Ensure root directory is in sys.path for mcp_server import
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.core.security import verify_admin_api_key
from mcp_server.main import (
    get_f1_overview,
    compare_corner_telemetry,
    get_fia_penalty_watch,
    get_trackside_media_sentiment,
    calculate_pit_strategy_loss,
    generate_morning_briefing
)

router = APIRouter()

@router.get("/sse", dependencies=[Depends(verify_admin_api_key)])
async def mcp_sse_endpoint():
    """Protected Remote MCP Server-Sent Events (SSE) Endpoint requiring X-API-Key header."""
    async def event_generator():
        yield f"event: endpoint\ndata: {json.dumps({'status': 'connected', 'tools': ['get_f1_overview', 'compare_corner_telemetry', 'get_fia_penalty_watch', 'get_trackside_media_sentiment', 'calculate_pit_strategy_loss', 'generate_morning_briefing']})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/tools/{tool_name}", dependencies=[Depends(verify_admin_api_key)])
def invoke_mcp_tool_remote(tool_name: str, payload: dict = {}):
    """Protected Remote MCP Tool Execution Endpoint requiring X-API-Key header."""
    tools = {
        "get_f1_overview": lambda p: get_f1_overview(),
        "compare_corner_telemetry": lambda p: compare_corner_telemetry(p.get("driver1", "NOR"), p.get("driver2", "VER")),
        "get_fia_penalty_watch": lambda p: get_fia_penalty_watch(),
        "get_trackside_media_sentiment": lambda p: get_trackside_media_sentiment(p.get("platform", "all")),
        "calculate_pit_strategy_loss": lambda p: calculate_pit_strategy_loss(p.get("gap_seconds", 18.5), p.get("condition", "green")),
        "generate_morning_briefing": lambda p: generate_morning_briefing(p.get("brief_type", "PRE_RACE"))
    }

    if tool_name not in tools:
        raise HTTPException(status_code=404, detail=f"MCP tool '{tool_name}' not found")

    result = tools[tool_name](payload)
    return {"status": "success", "tool": tool_name, "result": json.loads(result)}
