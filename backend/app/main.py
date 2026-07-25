import json
import os
import sys
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure data_pipeline is in path for fetchers and analytics
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(base_dir, "data_pipeline"))
sys.path.append(os.path.join(base_dir, "backend"))

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.db.models import MasterOverviewCache
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("F1FastAPI")

def populate_initial_db_cache():
    """Populate SQLite database cache from latest JSON feed if empty."""
    db = SessionLocal()
    try:
        existing = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
        if not existing:
            json_path = os.path.join(base_dir, "portal", "public", "data", "overview.json")
            if os.path.exists(json_path):
                with open(json_path, "r") as f:
                    content = f.read()
                db.add(MasterOverviewCache(id="latest", payload_json=content))
                db.commit()
                logger.info("Successfully populated SQLite master overview cache from JSON feed!")
    except Exception as e:
        logger.warning(f"DB cache initialization notice: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB Tables
    logger.info("🚀 Starting F1 Insights FastAPI Monolith...")
    Base.metadata.create_all(bind=engine)
    populate_initial_db_cache()
    yield
    # Shutdown
    logger.info("🛑 Shutting down F1 Insights FastAPI Monolith...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT)
