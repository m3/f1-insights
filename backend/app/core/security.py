import os
import sys
from fastapi import Header, HTTPException, status

app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

from core.config import settings

import logging

logger = logging.getLogger("f1_insights.audit")

def verify_admin_api_key(x_api_key: str = Header(None)):
    """FastAPI Dependency enforcing Admin API Key authorization on privileged endpoints."""
    if not x_api_key or x_api_key != settings.ADMIN_API_KEY:
        logger.warning("AUDIT: Unauthorized API Key access attempt rejected!")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header. Access denied to admin endpoints."
        )
    logger.info("AUDIT: Privileged endpoint access granted via valid Admin API Key.")
    return x_api_key
