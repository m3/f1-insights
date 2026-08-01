import json
import os
import sys
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

app_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

from core.database import get_db, settings
from db.models import MasterOverviewCache, TelemetryCache, StrategyCache, SocialCache

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint reporting WAL database status and system info."""
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        pass

    import shutil
    total, used, free = shutil.disk_usage("/")
    disk_free_gb = round(free / (1024 ** 3), 2)
    disk_percent_used = round((used / total) * 100, 1)

    return {
        "status": "healthy" if db_connected else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected" if db_connected else "error",
        "wal_mode": True,
        "environment": settings.ENVIRONMENT,
        "storage": {
            "free_gb": disk_free_gb,
            "used_percent": disk_percent_used,
            "status": "critical" if disk_free_gb < 2.0 else "healthy"
        }
    }

import time

_OVERVIEW_CACHE = {"timestamp": 0, "payload": None}

def _get_cache(db: Session, model):
    cache = db.query(model).filter(model.id == "latest").first()
    if cache and cache.payload_json:
        try:
            return json.loads(cache.payload_json)
        except Exception:
            pass
    return {}

@router.get("/overview")
def get_master_overview(db: Session = Depends(get_db)):
    """Master overview endpoint."""
    now = time.time()
    if _OVERVIEW_CACHE["payload"] and (now - _OVERVIEW_CACHE["timestamp"]) < 15:
        return _OVERVIEW_CACHE["payload"]

    data = _get_cache(db, MasterOverviewCache)
    
    if not data:
        pass

    if data:
        _OVERVIEW_CACHE["timestamp"] = now
        _OVERVIEW_CACHE["payload"] = data
        return data

    return {"status": "pending_data_ingestion"}

@router.get("/telemetry")
def get_telemetry(db: Session = Depends(get_db)):
    return _get_cache(db, TelemetryCache)

@router.get("/strategy")
def get_strategy(db: Session = Depends(get_db)):
    return _get_cache(db, StrategyCache)

@router.get("/social")
def get_social(db: Session = Depends(get_db)):
    return _get_cache(db, SocialCache)
