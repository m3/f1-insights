import json
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, settings
from app.db.models import MasterOverviewCache

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

    return {
        "status": "healthy" if db_connected else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected" if db_connected else "error",
        "wal_mode": True,
        "environment": settings.ENVIRONMENT
    }

@router.get("/overview")
def get_master_overview(db: Session = Depends(get_db)):
    """Master overview endpoint returning full aggregated dashboard JSON payload."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    if cache and cache.payload_json:
        return json.loads(cache.payload_json)

    # Fallback to reading portal/public/data/overview.json if DB cache is not populated yet
    fallback_path = os.path.join(settings.BASE_DIR, "portal", "public", "data", "overview.json")
    if os.path.exists(fallback_path):
        with open(fallback_path, "r") as f:
            return json.load(f)

    return {"status": "pending_data_ingestion"}
