import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.db.models import MasterOverviewCache

router = APIRouter()

@router.get("/drivers")
def get_driver_standings(db: Session = Depends(get_db)):
    """Returns World Driver Championship (WDC) standings."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        data = json.loads(cache.payload_json)
        return data.get("driverStandings", [])
    return []

@router.get("/constructors")
def get_constructor_standings(db: Session = Depends(get_db)):
    """Returns World Constructor Championship (WCC) standings."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        data = json.loads(cache.payload_json)
        return data.get("constructorStandings", [])
    return []
