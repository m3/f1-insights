import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import MasterOverviewCache

router = APIRouter()

@router.get("/feed")
def get_social_feed(db: Session = Depends(get_db)):
    """Returns combined X trackside news feed & YouTube watchalongs."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        data = json.loads(cache.payload_json)
        return data.get("socialSentiment", {})
    return {}
