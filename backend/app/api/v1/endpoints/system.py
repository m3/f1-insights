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
from db.models import MasterOverviewCache

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
    """Master overview endpoint returning full aggregated dashboard JSON payload with v4.0 schema versioning."""
    cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
    data = None
    if cache and cache.payload_json:
        try:
            data = json.loads(cache.payload_json)
        except Exception:
            pass

    if not data:
        fallback_path = os.path.join(settings.BASE_DIR, "portal", "public", "data", "overview.json")
        if os.path.exists(fallback_path):
            with open(fallback_path, "r") as f:
                data = json.load(f)

    if data and isinstance(data, dict):
        result = {
            "schema_version": "4.0",
            "provenance": data.get("provenance", {
                "sources": ["JolpicaErgast", "FastF1", "OpenMeteo", "SocialMediaRadar"],
                "confidence": 1.0,
                "status": "available",
                "is_synthetic": False
            })
        }
        for k, v in data.items():
            if k not in ["schema_version", "provenance"]:
                result[k] = v
        return result

    return {
        "schema_version": "4.0",
        "status": "pending_data_ingestion",
        "provenance": {
            "sources": ["JolpicaErgast"],
            "confidence": 0.0,
            "status": "pending",
            "is_synthetic": False
        }
    }
