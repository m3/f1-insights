import os
import sys
from fastapi import APIRouter, Depends
from core.security import verify_admin_api_key
from core.config import settings

router = APIRouter()

@router.post("/trigger-pipeline", dependencies=[Depends(verify_admin_api_key)])
def trigger_full_pipeline():
    """Protected admin endpoint to trigger a full telemetry data pipeline run synchronously."""
    try:
        if settings.BASE_DIR not in sys.path:
            sys.path.insert(0, settings.BASE_DIR)
        from data_pipeline.main import run_pipeline
        run_pipeline(mode="full")
        return {"status": "success", "message": "Full telemetry pipeline executed successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/trigger-social", dependencies=[Depends(verify_admin_api_key)])
def trigger_social_pipeline():
    """Protected admin endpoint to trigger a fast social feed update synchronously."""
    try:
        if settings.BASE_DIR not in sys.path:
            sys.path.insert(0, settings.BASE_DIR)
        from data_pipeline.main import run_pipeline
        run_pipeline(mode="social")
        return {"status": "success", "message": "Social feed update executed successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
