import json
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db, settings
from app.db.models import MasterOverviewCache

router = APIRouter()

@router.get("/")
def get_schedule(db: Session = Depends(get_db)):
    """Returns season calendar schedule."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        data = json.loads(cache.payload_json)
        return data.get("schedule", [])
    
    return []

@router.get("/current")
def get_current_race(db: Session = Depends(get_db)):
    """Returns current/next target Grand Prix weekend."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        data = json.loads(cache.payload_json)
        return data.get("currentRace", {})
    
    return {}
