import json
import os
import sys
from datetime import datetime

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    class FastMCP:
        def __init__(self, name):
            self.name = name
        def tool(self, *args, **kwargs):
            def decorator(func):
                return func
            return decorator
        def run(self):
            print(f"[{self.name}] FastMCP fallback runner initialized.")

# Ensure backend app is in sys.path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app_path = os.path.join(base_dir, "backend", "app")
if app_path not in sys.path:
    sys.path.insert(0, app_path)

from core.database import SessionLocal
from db.models import MasterOverviewCache, BriefModel, PenaltyPointModel

# Initialize FastMCP Server
mcp = FastMCP("F1 Insights Engine")

def format_mcp_response(data: any, source: str = "JolpicaErgast", confidence: float = 1.0, status: str = "ok") -> str:
    """Formats standardized, versioned MCP response contract with provenance and confidence metadata."""
    payload = {
        "schema_version": "4.0",
        "status": status,
        "confidence": confidence,
        "source": source,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "stale": False,
        "data": data
    }
    return json.dumps(payload, indent=2)

@mcp.tool()
def get_f1_overview() -> str:
    """Retrieves the master aggregated F1 overview payload including current race info, top standings, and latest briefings."""
    db = SessionLocal()
    try:
        cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
        if cache and cache.payload_json:
            parsed = json.loads(cache.payload_json)
            return format_mcp_response(parsed, source="MasterOverviewCache")
        
        fallback_path = os.path.join(base_dir, "portal", "public", "data", "overview.json")
        if os.path.exists(fallback_path):
            with open(fallback_path, "r") as f:
                parsed = json.load(f)
                return format_mcp_response(parsed, source="LocalFileCache")
        return format_mcp_response({"status": "pending_data_ingestion"}, status="pending", confidence=0.0)
    finally:
        db.close()

@mcp.tool()
def compare_corner_telemetry(driver1: str = "NOR", driver2: str = "VER") -> str:
    """Compares corner speed, gear, and throttle telemetry traces for two driver codes (e.g. NOR vs VER)."""
    db = SessionLocal()
    try:
        cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
        if cache and cache.payload_json:
            data = json.loads(cache.payload_json)
            traces = data.get("telemetryTraces", {})
            result = {
                "driver1": driver1,
                "driver2": driver2,
                "drivers": traces.get("drivers", {}),
                "traceData": traces.get("traceData", [])
            }
            return format_mcp_response(result, source="FastF1")
        return format_mcp_response({"driver1": driver1, "driver2": driver2, "drivers": {}, "traceData": []}, source="FastF1", confidence=0.0, status="pending")
    finally:
        db.close()

@mcp.tool()
def get_fia_penalty_watch() -> str:
    """Retrieves drivers accumulated penalty points and flags drivers at high risk of a 1-race ban (12 points threshold)."""
    db = SessionLocal()
    try:
        cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
        if cache and cache.payload_json:
            data = json.loads(cache.payload_json)
            penalties = data.get("penaltyPoints", [])
            at_risk = [d for d in penalties if d.get("points", 0) >= 8 or d.get("is_at_risk", False)]
            result = {
                "high_risk_drivers": at_risk,
                "total_drivers_flagged": len(at_risk),
                "penalty_standings": penalties
            }
            return format_mcp_response(result, source="TracingInsightsArchive")
        return format_mcp_response({"high_risk_drivers": [], "total_drivers_flagged": 0}, status="pending")
    finally:
        db.close()

@mcp.tool()
def get_trackside_media_sentiment(platform: str = "all") -> str:
    """Retrieves multi-platform media sentiment analysis across accredited X journalists, team accounts, and YouTube watchalongs."""
    db = SessionLocal()
    try:
        cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
        if cache and cache.payload_json:
            data = json.loads(cache.payload_json)
            social = data.get("socialSentiment", {})
            return format_mcp_response(social, source="SocialMediaRadar")
        return format_mcp_response({"status": "no_sentiment_data"}, status="pending")
    finally:
        db.close()

@mcp.tool()
def calculate_pit_strategy_loss(gap_seconds: float = 18.5, condition: str = "green") -> str:
    """Calculates pit lane traversal time loss and gap re-entry delta under Green Flag, VSC, or Full SC conditions."""
    pit_loss_map = {"green": 21.8, "vsc": 13.5, "sc": 10.2}
    loss = pit_loss_map.get(condition.lower(), 21.8)
    net_delta = gap_seconds - loss
    emerges_ahead = net_delta > 0

    result = {
        "condition": condition.upper(),
        "input_gap_seconds": gap_seconds,
        "pit_traversal_loss_seconds": loss,
        "net_delta_seconds": round(net_delta, 2),
        "emerges_ahead": emerges_ahead,
        "status_assessment": "CLEAR PIT RE-ENTRY WINDOW" if emerges_ahead else "TRAFFIC & OVERCUT RISK"
    }
    return format_mcp_response(result, source="F1StrategyEngine")

@mcp.tool()
def generate_morning_briefing(brief_type: str = "PRE_RACE") -> str:
    """Generates an AI-curated executive Markdown briefing for the active race weekend, ready for Discord/Telegram dispatch."""
    db = SessionLocal()
    try:
        cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
        if cache and cache.payload_json:
            data = json.loads(cache.payload_json)
            brief = data.get("latestPreBrief") if brief_type.upper() == "PRE_RACE" else data.get("latestPostBrief")
            if brief:
                return format_mcp_response(brief, source="AIBriefGenerator")
        return format_mcp_response({"title": "F1 Briefing Pending", "markdown_content": "Briefing data pending pipeline execution."}, status="pending")
    finally:
        db.close()

if __name__ == "__main__":
    mcp.run()
