import json
import os
import sys
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure app directory, backend root, and data_pipeline are in sys.path
app_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(app_dir)
root_dir = os.path.dirname(backend_dir)

for path in [app_dir, backend_dir, os.path.join(root_dir, "data_pipeline")]:
    if path not in sys.path:
        sys.path.insert(0, path)

from core.config import settings
from core.database import engine, Base, SessionLocal
from db.models import MasterOverviewCache
from api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("F1FastAPI")

def populate_initial_db_cache():
    """No-op. Legacy JSON mock feed has been purged."""
    pass

from worker.tasks import pipeline_worker_loop

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB Tables & Security Checks
    logger.info("🚀 Starting F1 Insights FastAPI Monolith...")
    if settings.ENVIRONMENT.lower() == "production" and settings.ADMIN_API_KEY == "f1-insights-admin-secret-key-2026":
        logger.critical("FATAL: Production deployment MUST configure a non-default ADMIN_API_KEY!")
        raise ValueError("CRITICAL: Insecure default ADMIN_API_KEY detected in production environment!")
        
    Base.metadata.create_all(bind=engine)
    populate_initial_db_cache()
    
    # Start the persistent background worker
    worker_task = asyncio.create_task(pipeline_worker_loop())
    
    yield
    # Shutdown
    logger.info("🛑 Shutting down F1 Insights FastAPI Monolith...")
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware (Restricted origins with environment override)
allowed_origins = [origin.strip() for origin in settings.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
