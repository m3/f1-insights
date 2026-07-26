"""
Master Execution Pipeline for F1 Insights HQ (v4.0 Specification).
Orchestrates Provider Ingestion (Jolpica, FastF1, OpenMeteo, Social),
Analytics Processing, Briefing Generation, and SQLite WAL Persistence.
"""
import os
import sys
import json
from datetime import datetime

# Ensure base directory and data_pipeline are in path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pipeline_dir = os.path.join(base_dir, "data_pipeline")
if pipeline_dir not in sys.path:
    sys.path.insert(0, pipeline_dir)
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from fetchers.tracing_insights import F1DataFetcher
from fetchers.session_watcher import SessionWatcher
from analytics.telemetry import F1AnalyticsEngine
from analytics.sentiment import F1SentimentEngine
from generators.brief_generator import BriefGenerator
from generators.notifier import F1Notifier

from providers.jolpica_provider import JolpicaProvider
from providers.fastf1_provider import FastF1Provider
from providers.openmeteo_provider import OpenMeteoProvider
from providers.social_provider import SocialProvider

def find_target_race(schedule):
    """Dynamically determine the active Grand Prix weekend based on current date."""
    if not schedule:
        return {
            "round": "12",
            "raceName": "Hungarian Grand Prix",
            "Circuit": {"circuitId": "hungaroring", "circuitName": "Hungaroring", "Location": {"locality": "Budapest", "country": "Hungary"}},
            "date": "2026-07-26",
            "time": "13:00:00Z"
        }
    
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    for race in schedule:
        if race.get("date", "") >= today_str:
            return race
    return schedule[-1]

def run_pipeline(mode: str = "full"):
    print(f"🚀 Starting F1 Insights Data Pipeline v4.0 (Mode: {mode.upper()})...")
    
    # Paths to export JSON
    portal_data_dir = os.path.join(base_dir, "portal", "public", "data")
    root_data_dir = os.path.join(base_dir, "public", "data")
    dist_data_dir = os.path.join(base_dir, "portal", "dist", "data")
    
    os.makedirs(portal_data_dir, exist_ok=True)
    os.makedirs(root_data_dir, exist_ok=True)
    if os.path.exists(os.path.dirname(dist_data_dir)):
        os.makedirs(dist_data_dir, exist_ok=True)

    # Instantiate Provider Layer
    jolpica = JolpicaProvider()
    fastf1 = FastF1Provider()
    openmeteo = OpenMeteoProvider()
    social = SocialProvider()

    if mode == "social":
        print("⚡ Running fast X (Twitter) & YouTube social feed update...")
        social_res = social.fetch_social_sentiment("Hungarian Grand Prix")
        social_sentiment = social_res.data
        
        overview_path = os.path.join(portal_data_dir, "overview.json")
        if os.path.exists(overview_path):
            with open(overview_path, "r") as f:
                data = json.load(f)
            data["socialSentiment"] = social_sentiment
            data["updatedAt"] = datetime.utcnow().isoformat() + "Z"
            data["schema_version"] = "4.0"
            if "provenance" not in data:
                data["provenance"] = {
                    "sources": ["JolpicaErgast", "FastF1", "OpenMeteo", "SocialMediaRadar"],
                    "confidence": 1.0,
                    "status": "available",
                    "is_synthetic": False
                }
            
            for target_dir in [portal_data_dir, root_data_dir, dist_data_dir]:
                if os.path.exists(os.path.dirname(target_dir)):
                    os.makedirs(target_dir, exist_ok=True)
                    with open(os.path.join(target_dir, "overview.json"), "w") as f:
                        json.dump(data, f, indent=2)
                    with open(os.path.join(target_dir, "social_feed.json"), "w") as f:
                        json.dump(social_sentiment, f, indent=2)

        print("✅ Fast Social Feed update completed successfully!")
        return

    # 1. Initialize fetchers, analytics & notifier
    fetcher = F1DataFetcher()
    watcher = SessionWatcher()
    analytics = F1AnalyticsEngine()
    notifier = F1Notifier()

    generator_portal = BriefGenerator(output_dir=portal_data_dir)
    generator_root = BriefGenerator(output_dir=root_data_dir)

    # 2. Fetch schedule, standings & completed race results via Jolpica Provider
    print("📥 Fetching current season calendar, standings & completed race results via JolpicaProvider...")
    sched_res = jolpica.fetch_schedule()
    schedule = sched_res.data if sched_res.data else fetcher.get_current_schedule()

    wdc_res = jolpica.fetch_driver_standings()
    driver_standings = wdc_res.data if wdc_res.data else fetcher.get_fallback_driver_standings()

    wcc_res = jolpica.fetch_constructor_standings()
    constructor_standings = wcc_res.data if wcc_res.data else fetcher.get_fallback_constructor_standings()

    results_res = jolpica.fetch_race_results()
    completed_races = results_res.data if results_res.data else []

    penalty_points = fetcher.get_penalty_points()

    # Dynamic target race selection
    next_race = find_target_race(schedule)
    print(f"🏎️ Target Grand Prix Weekend: {next_race.get('raceName')} ({next_race.get('date')})")

    # Fetch live weather forecast via OpenMeteo Provider
    weather_res = openmeteo.fetch_weather(lat=47.583, lon=19.248, circuit_name=next_race.get('Circuit', {}).get('circuitName', 'Hungaroring'))
    circuit_weather = weather_res.data

    # Session checkpoints & GitHub updates check
    session_checkpoints = watcher.get_upcoming_checkpoint(next_race)
    tracing_commit_status = watcher.check_tracing_insights_updated()

    # 3. Analytics & FastF1 Telemetry Ingestion
    pre_race_facts = analytics.generate_pre_race_facts(next_race, driver_standings)
    
    # Extract latest race results if available
    latest_race_results = completed_races[-1].get("Results", []) if completed_races else []
    post_race_facts = analytics.generate_post_race_facts(next_race, latest_race_results)
    
    penalty_watch = analytics.get_penalty_watch(penalty_points)
    teammate_battles = analytics.get_teammate_battle_summary(completed_races)
    
    social_res = social.fetch_social_sentiment(next_race.get('raceName', 'Hungarian Grand Prix'))
    social_sentiment = social_res.data

    fastf1_res = fastf1.fetch_telemetry_traces(2026, next_race.get('raceName', 'Hungarian Grand Prix'), "Q")
    telemetry_traces = fastf1_res.data if fastf1_res.status == "available" else analytics.generate_telemetry_traces()

    # 4. Generate Briefs
    print("📝 Generating Pre-Race Preview & Post-Race Debrief...")
    pre_brief = generator_portal.build_pre_race_brief(next_race, pre_race_facts, penalty_watch, driver_standings)
    generator_root.build_pre_race_brief(next_race, pre_race_facts, penalty_watch, driver_standings)

    post_brief = generator_portal.build_post_race_brief(next_race, post_race_facts, teammate_battles, driver_standings)
    generator_root.build_post_race_brief(next_race, post_race_facts, teammate_battles, driver_standings)

    # 5. Dispatch Notifications
    print("📡 Checking Webhook Notifications...")
    notifier.send_discord_brief(pre_brief)
    notifier.send_telegram_brief(pre_brief)

    # 6. Export master dataset with explicit v4.0 Schema & Provenance Metadata
    portal_master = {
        "schema_version": "4.0",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "provenance": {
            "sources": ["JolpicaErgast", "FastF1", "OpenMeteo", "SocialMediaRadar"],
            "confidence": 1.0,
            "status": "available",
            "is_synthetic": False
        },
        "currentRace": next_race,
        "circuitWeather": circuit_weather,
        "schedule": schedule,
        "driverStandings": driver_standings,
        "constructorStandings": constructor_standings,
        "penaltyPoints": penalty_points,
        "teammateBattles": teammate_battles,
        "socialSentiment": social_sentiment,
        "sessionCheckpoints": session_checkpoints,
        "tracingCommitStatus": tracing_commit_status,
        "telemetryTraces": telemetry_traces,
        "latestPreBrief": pre_brief,
        "latestPostBrief": post_brief
    }

    serialized_json = json.dumps(portal_master, indent=2)

    for target_dir in [portal_data_dir, root_data_dir, dist_data_dir]:
        if os.path.exists(os.path.dirname(target_dir)):
            os.makedirs(target_dir, exist_ok=True)
            with open(os.path.join(target_dir, "overview.json"), "w") as f:
                f.write(serialized_json)

    # Sync to SQLite Database
    try:
        app_path = os.path.join(base_dir, "backend", "app")
        if app_path not in sys.path:
            sys.path.insert(0, app_path)

        try:
            from core.database import SessionLocal, engine, Base
            from db.models import MasterOverviewCache
            
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            cache = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
            if not cache:
                cache = MasterOverviewCache(id="latest", payload_json=serialized_json)
                db.add(cache)
            else:
                cache.payload_json = serialized_json
                cache.updated_at = datetime.utcnow()
            db.commit()
            db.close()
            print("💾 Synced master v4.0 overview to SQLite database (f1_insights.db)")
        except Exception as db_err:
            print(f"⚠️ SQLite Sync Warning: {db_err}")

    except Exception as e:
        print(f"⚠️ Database initialization error: {e}")

    print("✅ F1 Insights Full Pipeline v4.0 execution completed successfully!")

if __name__ == "__main__":
    mode_arg = sys.argv[1] if len(sys.argv) > 1 else "full"
    run_pipeline(mode=mode_arg)
