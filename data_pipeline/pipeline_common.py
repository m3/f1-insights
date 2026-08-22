"""
Shared pipeline primitives used by both the persistent async worker
(backend/app/worker/tasks.py) and the cron data pipeline (data_pipeline/main.py).

Single source of truth for:
  * the schema v5.0 core_overview payload (build_core_overview)
  * the chunked telemetry/strategy payloads
  * the SQLAlchemy CQRS cache writer (sync_caches_to_db)
  * idempotent notification trigger dispatch (NotificationTrigger)
"""
import os
import sys
import json
import logging
from datetime import datetime

logger = logging.getLogger("PipelineCommon")

# Load core.database/db.models via a single consistent module path, matching
# how backend/app imports itself, to avoid a duplicated Base/engine pair.
_here = os.path.dirname(os.path.abspath(__file__))
_backend_app = os.path.join(os.path.dirname(_here), "backend", "app")
if _backend_app not in sys.path:
    sys.path.insert(0, _backend_app)

from core.database import SessionLocal, engine, Base
from db.models import (
    MasterOverviewCache, TelemetryCache, StrategyCache, SocialCache,
    NotificationLog,
)


def _ensure_tables():
    Base.metadata.create_all(bind=engine)


def build_core_overview(next_race, circuit_weather, schedule, driver_standings,
                        constructor_standings, pre_brief, post_brief,
                        teammate_battles, macro_state, tracing_commit_sha,
                        ti_sessions):
    """Build the canonical schema v5.0 core overview payload."""
    return {
        "schema_version": "5.0",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "timeline": macro_state,
        "provenance": {
            "sources": ["JolpicaErgast", "TracingInsights", "OpenMeteo"],
            "tracingInsightsCommit": tracing_commit_sha,
            "tracingInsightsSessions": ti_sessions,
            "confidence": 1.0,
            "status": "available",
            "is_synthetic": False
        },
        "currentRace": next_race,
        "circuitWeather": circuit_weather,
        "schedule": schedule,
        "driverStandings": driver_standings,
        "constructorStandings": constructor_standings,
        "latestPreBrief": pre_brief,
        "latestPostBrief": post_brief,
        "teammateBattles": teammate_battles
    }


def build_telemetry_data(sector_matrix, circuit_specs):
    return {
        "sectorMatrix": sector_matrix,
        "circuitSpecs": circuit_specs
    }


def build_strategy_data(grid_penalties, penalty_watch, tyre_strategy, pit_stops):
    return {
        "gridPenalties": grid_penalties,
        "penaltyWatch": penalty_watch,
        "tyreStrategy": tyre_strategy,
        "pitStops": pit_stops
    }


def sync_caches_to_db(core_overview, telemetry_data, strategy_data, social_data):
    """Persist chunked payloads to the SQLAlchemy CQRS cache tables."""
    _ensure_tables()
    db = SessionLocal()
    try:
        db.query(MasterOverviewCache).delete()
        db.query(TelemetryCache).delete()
        db.query(StrategyCache).delete()
        db.query(SocialCache).delete()

        db.add(MasterOverviewCache(id="latest", payload_json=json.dumps(core_overview)))
        db.add(TelemetryCache(id="latest", payload_json=json.dumps(telemetry_data)))
        db.add(StrategyCache(id="latest", payload_json=json.dumps(strategy_data)))
        db.add(SocialCache(id="latest", payload_json=json.dumps(social_data)))
        db.commit()
        logger.info("Synced chunked payloads to SQLite caches successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"SQLite sync error: {e}")
    finally:
        db.close()


class NotificationTrigger:
    """Dispatches briefs on macro-state transitions, firing once per session."""

    QUALI_SESSION_TYPES = {"MainQuali", "Qualifying", "Q"}
    RACE_SESSION_TYPES = {"MainRace", "Race", "R"}

    def _brief_for(self, session_type, pre_brief, post_brief):
        if session_type in self.QUALI_SESSION_TYPES:
            return "PRE_RACE", pre_brief
        if session_type in self.RACE_SESSION_TYPES:
            return "POST_RACE", post_brief
        return None, None

    def _is_dispatched(self, race_name, session_type, brief_type):
        db = SessionLocal()
        try:
            return db.query(NotificationLog).filter(
                NotificationLog.race_name == race_name,
                NotificationLog.session_type == session_type,
                NotificationLog.brief_type == brief_type,
            ).first() is not None
        finally:
            db.close()

    def _record(self, race_name, session_type, brief_type):
        db = SessionLocal()
        try:
            db.add(NotificationLog(
                race_name=race_name,
                session_type=session_type,
                brief_type=brief_type,
            ))
            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning(f"Failed to record notification log: {e}")
        finally:
            db.close()

    def dispatch_if_due(self, macro_state, race_name, pre_brief, post_brief, send_fn):
        """Dispatch pre/post-race briefs on POST_SESSION transitions. Returns dispatched brief types."""
        if not macro_state or macro_state.get("macroState") != "POST_SESSION":
            return []

        session_type = macro_state.get("sessionType")
        brief_type, brief = self._brief_for(session_type, pre_brief, post_brief)
        if not brief_type or not brief:
            return []

        _ensure_tables()
        if self._is_dispatched(race_name, session_type, brief_type):
            return []

        if send_fn(brief):
            self._record(race_name, session_type, brief_type)
            logger.info(f"Dispatched {brief_type} brief for {race_name} ({session_type}).")
            return [brief_type]

        return []
