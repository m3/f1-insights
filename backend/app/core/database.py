import os
import sys
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

from core.config import settings

# Create directory if needed
os.makedirs(os.path.dirname(settings.SQLITE_DB_PATH), exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{settings.SQLITE_DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 15}
)

# Enable WAL Mode and High Performance PRAGMAs on connection
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode = WAL")
    cursor.execute("PRAGMA synchronous = NORMAL")
    cursor.execute("PRAGMA busy_timeout = 5000")
    cursor.execute("PRAGMA foreign_keys = ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
