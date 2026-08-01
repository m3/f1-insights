import os
import sys
import json
import asyncio
import logging
from datetime import datetime
from tenacity import retry, wait_exponential, stop_after_attempt
import httpx

app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
root_dir = os.path.dirname(app_dir)
pipeline_dir = os.path.join(root_dir, "data_pipeline")

if pipeline_dir not in sys.path:
    sys.path.insert(0, pipeline_dir)

from core.database import SessionLocal
from db.models import MasterOverviewCache, TelemetryCache, StrategyCache, SocialCache

from providers.jolpica_provider import JolpicaProvider
from providers.openmeteo_provider import OpenMeteoProvider
from providers.social_provider import SocialProvider

from fetchers.tracing_insights import F1DataFetcher
from fetchers.tracing_reader import TracingInsightsReader
from fetchers.session_watcher import SessionWatcher
from analytics.telemetry import F1AnalyticsEngine
from generators.brief_generator import BriefGenerator
from generators.notifier import F1Notifier

logger = logging.getLogger("F1Worker")

def sync_caches_to_db(core_overview, telemetry_data, strategy_data, social_data):
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
        logger.info("💾 Synced chunked payloads to SQLite caches successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"⚠️ SQLite sync error: {e}")
    finally:
        db.close()

def find_target_race(schedule):
    now_str = datetime.utcnow().strftime("%Y-%m-%d")
    for race in schedule:
        if race.get("date", "") >= now_str:
            return race
    return schedule[-1] if schedule else {}

@retry(wait=wait_exponential(multiplier=1, min=2, max=10), stop=stop_after_attempt(3))
async def run_pipeline_async():
    """True asynchronous pipeline logic wrapped in a retry handler."""
    logger.info("⚙️ Running persistent background pipeline...")
    
    jolpica = JolpicaProvider()
    openmeteo = OpenMeteoProvider()
    social = SocialProvider()
    
    fetcher = F1DataFetcher()
    tracing = TracingInsightsReader()
    watcher = SessionWatcher()
    notifier = F1Notifier()
    
    try:
        await asyncio.to_thread(tracing.pull_latest)
    except Exception:
        pass
        
    analytics = F1AnalyticsEngine(tracing_reader=tracing)
    generator = BriefGenerator(output_dir="/tmp")
    
    # Run all Jolpica network I/O in parallel!
    sched_task = jolpica.fetch_schedule()
    wdc_task = jolpica.fetch_driver_standings()
    wcc_task = jolpica.fetch_constructor_standings()
    results_task = jolpica.fetch_race_results()
    
    sched_res, wdc_res, wcc_res, results_res = await asyncio.gather(
        sched_task, wdc_task, wcc_task, results_task, return_exceptions=False
    )
    
    schedule = sched_res.data if sched_res.data else fetcher.get_current_schedule()
    driver_standings = wdc_res.data if wdc_res.data else fetcher.get_fallback_driver_standings()
    constructor_standings = wcc_res.data if wcc_res.data else fetcher.get_fallback_constructor_standings()
    completed_races = results_res.data if results_res.data else []
    
    penalty_points = fetcher.get_penalty_points()
    next_race = find_target_race(schedule)
    race_name = next_race.get('raceName', '')
    
    # Run tracing logic in thread to prevent blocking the event loop with large JSON parsing
    ti_sessions = await asyncio.to_thread(tracing.get_available_sessions, race_name)
    ti_weather = await asyncio.to_thread(tracing.build_session_weather_summary, race_name, "Race")
    
    if ti_weather:
        circuit_weather = ti_weather
    else:
        circuit = next_race.get('Circuit', {})
        lat = float(circuit.get('Location', {}).get('lat', 47.583))
        lng = float(circuit.get('Location', {}).get('long', 19.248))
        weather_res = await openmeteo.fetch_weather(lat=lat, lon=lng, circuit_name=circuit.get('circuitName', 'Circuit'))
        circuit_weather = weather_res.data
        
    pre_race_facts = await asyncio.to_thread(analytics.generate_pre_race_facts, next_race, driver_standings)
    
    latest_race = completed_races[-1] if completed_races else {}
    if str(latest_race.get("round", "")) == str(next_race.get("round", "")):
        latest_race_results = latest_race.get("Results", [])
    else:
        latest_race_results = []
        
    post_race_facts = await asyncio.to_thread(analytics.generate_post_race_facts, next_race, latest_race_results)
    
    penalty_watch = await asyncio.to_thread(analytics.get_penalty_watch, penalty_points)
    teammate_battles = await asyncio.to_thread(analytics.get_teammate_battle_summary, completed_races)
    sector_matrix = await asyncio.to_thread(analytics.generate_sector_matrix, race_name=race_name)
    grid_penalties = await asyncio.to_thread(analytics.generate_grid_penalties, race_name=race_name)
    circuit_specs = await asyncio.to_thread(analytics.generate_circuit_blueprint_specs, next_race)
    tyre_strategy = await asyncio.to_thread(analytics.build_tyre_strategy_summary, race_name=race_name)
    pit_stops = await asyncio.to_thread(analytics.build_pit_strategy, race_name=race_name)
    
    social_res = await social.fetch_social_sentiment(race_name)
    social_sentiment = social_res.data
    
    pre_brief = await asyncio.to_thread(generator.build_pre_race_brief, next_race, pre_race_facts, penalty_watch, driver_standings)
    post_brief = await asyncio.to_thread(generator.build_post_race_brief, next_race, post_race_facts, teammate_battles, driver_standings)
    
    core_overview = {
        "schema_version": "5.0",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "provenance": {
            "sources": ["JolpicaErgast", "TracingInsights", "OpenMeteo"],
            "tracingInsightsCommit": await asyncio.to_thread(tracing.get_latest_commit_sha),
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
    
    telemetry_data = {
        "sectorMatrix": sector_matrix,
        "circuitSpecs": circuit_specs
    }
    
    strategy_data = {
        "gridPenalties": grid_penalties,
        "penaltyWatch": penalty_watch,
        "tyreStrategy": tyre_strategy,
        "pitStops": pit_stops
    }
    
    await asyncio.to_thread(sync_caches_to_db, core_overview, telemetry_data, strategy_data, social_sentiment)
    
    pre_trigger_res = await asyncio.to_thread(watcher.should_trigger_pre_race_update, next_race)
    post_trigger_res = await asyncio.to_thread(watcher.should_trigger_post_race_debrief, next_race)

    if pre_trigger_res.get("should_trigger"):
        await asyncio.to_thread(notifier.send_discord_brief, pre_brief)
    if post_trigger_res.get("should_trigger"):
        await asyncio.to_thread(notifier.send_discord_brief, post_brief)

async def pipeline_worker_loop():
    """Async loop managed by FastAPI lifespan."""
    logger.info("🚀 Starting async background pipeline worker...")
    while True:
        try:
            # Run the natively asynchronous pipeline directly on the event loop
            await run_pipeline_async()
        except Exception as e:
            logger.error(f"❌ Background pipeline unhandled crash: {e}")
            
        # Hardcoded to 5 minutes for now; could be tied to SessionWatcher state
        logger.info("💤 Pipeline sleeping for 5 minutes...")
        await asyncio.sleep(300)
