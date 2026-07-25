import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import MasterOverviewCache

router = APIRouter()

@router.get("/latest")
def get_latest_brief(
    type: str = Query("PRE_RACE", description="Brief type: PRE_RACE or POST_RACE"),
    db: Session = Depends(get_db)
):
    """Returns the latest Pre-Race Preview or Post-Race Debrief."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        data = json.loads(cache.payload_json)
        if type == "POST_RACE":
            return data.get("latestPostBrief", {})
        return data.get("latestPreBrief", {})
    return {}
