import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import MasterOverviewCache

router = APIRouter()

@router.get("/penalty-watch")
def get_penalty_watch(db: Session = Depends(get_db)):
    """Returns FIA driver penalty points status & ban risks."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        data = json.loads(cache.payload_json)
        return data.get("penaltyPoints", [])
    return []
