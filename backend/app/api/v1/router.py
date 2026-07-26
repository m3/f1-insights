from fastapi import APIRouter
from app.api.v1.endpoints import system, schedule, standings, telemetry, briefs, social, drivers, admin, mcp_sse

api_router = APIRouter()

api_router.include_router(system.router, tags=["System"])
api_router.include_router(schedule.router, prefix="/schedule", tags=["Schedule"])
api_router.include_router(standings.router, prefix="/standings", tags=["Standings"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry"])
api_router.include_router(briefs.router, prefix="/briefs", tags=["Briefings"])
api_router.include_router(social.router, prefix="/social", tags=["Social"])
api_router.include_router(drivers.router, prefix="/drivers", tags=["Drivers"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(mcp_sse.router, prefix="/mcp", tags=["MCP Server"])
