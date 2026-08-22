import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import SocialCache

router = APIRouter()

@router.get("/feed")
def get_social_feed(db: Session = Depends(get_db)):
    """Returns combined X trackside news feed & YouTube watchalongs."""
    cache = db.query(SocialCache).filter(SocialCache.id == "latest").first()
    if cache and cache.payload_json:
        return json.loads(cache.payload_json)
    return {}
