import os
import sys
import subprocess
from fastapi import APIRouter, Depends
from core.security import verify_admin_api_key
from core.config import settings

router = APIRouter()

@router.post("/trigger-pipeline", dependencies=[Depends(verify_admin_api_key)])
def trigger_full_pipeline():
    """Protected admin endpoint to trigger a full telemetry data pipeline run."""
    try:
        pipeline_script = os.path.join(settings.BASE_DIR, "data_pipeline", "main.py")
        venv_python = os.path.join(settings.BASE_DIR, ".venv", "bin", "python")
        python_bin = venv_python if os.path.exists(venv_python) else sys.executable

        subprocess.Popen([python_bin, pipeline_script])
        return {"status": "success", "message": "Full telemetry pipeline triggered asynchronously"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/trigger-social", dependencies=[Depends(verify_admin_api_key)])
def trigger_social_pipeline():
    """Protected admin endpoint to trigger a fast social feed update."""
    try:
        pipeline_script = os.path.join(settings.BASE_DIR, "data_pipeline", "main.py")
        venv_python = os.path.join(settings.BASE_DIR, ".venv", "bin", "python")
        python_bin = venv_python if os.path.exists(venv_python) else sys.executable

        subprocess.Popen([python_bin, pipeline_script, "--mode=social"])
        return {"status": "success", "message": "Social feed update triggered asynchronously"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
