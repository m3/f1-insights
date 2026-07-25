import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import MasterOverviewCache

router = APIRouter()

@router.get("/compare")
def compare_telemetry(
    driver1: str = Query("NOR", description="First driver code (e.g. NOR)"),
    driver2: str = Query("VER", description="Second driver code (e.g. VER)"),
    db: Session = Depends(get_db)
):
    """Compares lap telemetry speed and throttle traces across lap distance for two drivers."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        data = json.loads(cache.payload_json)
        traces = data.get("telemetryTraces", {})
        return {
            "driver1": driver1,
            "driver2": driver2,
            "drivers": traces.get("drivers", {}),
            "traceData": traces.get("traceData", [])
        }
    return {"driver1": driver1, "driver2": driver2, "drivers": {}, "traceData": []}
