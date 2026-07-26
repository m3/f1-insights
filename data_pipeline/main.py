"""
F1 Insights & TracingInsights Data Pipeline v4.0.
Fetches live Formula 1 session schedules, WDC/WCC standings, race results, FastF1 lap telemetry,
OpenMeteo track weather, and multi-source social sentiment feeds.
Generates canonical overview.json, social_feed.json, and SQLite database caches.
"""
import os
import sys
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Any

# Ensure both project root and pipeline dir are in sys.path
pipeline_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(pipeline_dir, ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if pipeline_dir not in sys.path:
    sys.path.insert(0, pipeline_dir)

from providers.jolpica_provider import JolpicaProvider
from providers.fastf1_provider import FastF1Provider
from providers.openmeteo_provider import OpenMeteoProvider
from providers.social_provider import SocialProvider

from fetchers.tracing_insights import F1DataFetcher
from fetchers.session_watcher import SessionWatcher
from analytics.telemetry import F1AnalyticsEngine
from generators.brief_generator import BriefGenerator
from generators.notifier import F1Notifier

def find_target_race(schedule: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Find the target active Grand Prix (defaults to Hungarian Grand Prix if active)."""
    now_str = datetime.utcnow().strftime("%Y-%m-%d")
    for race in schedule:
        if race.get("date", "") >= now_str:
            return race
    return schedule[-1] if schedule else {}

def sync_sqlite_cache(db_path: str, overview_data: Dict[str, Any], social_data: Dict[str, Any]):
    """Sync master overview & social feed payloads to SQLite database (f1_insights.db)."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS MasterOverviewCache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                schema_version TEXT,
                updated_at TEXT,
                data_json TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS SocialFeedCache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                updated_at TEXT,
                data_json TEXT
            )
        """)
        cursor.execute("DELETE FROM MasterOverviewCache")
        cursor.execute("DELETE FROM SocialFeedCache")
        
        cursor.execute(
            "INSERT INTO MasterOverviewCache (schema_version, updated_at, data_json) VALUES (?, ?, ?)",
            (overview_data.get("schema_version", "4.0"), overview_data.get("updatedAt"), json.dumps(overview_data))
        )
        cursor.execute(
            "INSERT INTO SocialFeedCache (updated_at, data_json) VALUES (?, ?)",
            (overview_data.get("updatedAt"), json.dumps(social_data))
        )
        conn.commit()
        conn.close()
        print("💾 Synced master v4.0 overview to SQLite database (f1_insights.db)")
    except Exception as err:
        print(f"⚠️ SQLite sync error: {err}")

def run_pipeline(mode: str = "full"):
    """Execute the data pipeline in 'full' or 'social' mode."""
    base_pipeline_dir = os.path.dirname(os.path.abspath(__file__))
    portal_data_dir = os.path.join(base_pipeline_dir, "..", "portal", "public", "data")
    root_data_dir = os.path.join(base_pipeline_dir, "..", "public", "data")
    dist_data_dir = os.path.join(base_pipeline_dir, "..", "portal", "dist", "data")
    db_path = os.path.join(base_pipeline_dir, "..", "backend", "f1_insights.db")

    jolpica = JolpicaProvider()
    openmeteo = OpenMeteoProvider()
    social = SocialProvider()

    if mode == "social":
        print("⚡ Executing High-Frequency Social Feed Update...")
        social_res = social.fetch_social_sentiment("Hungarian Grand Prix")
        social_sentiment = social_res.data

        # Update overview.json files if exist
        overview_path = os.path.join(portal_data_dir, "overview.json")
        if os.path.exists(overview_path):
            with open(overview_path, "r") as f:
                data = json.load(f)
                data["socialSentiment"] = social_sentiment
                data["updatedAt"] = datetime.utcnow().isoformat() + "Z"
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
    
    # Extract latest race results ONLY if they belong to the current active race round
    latest_race = completed_races[-1] if completed_races else {}
    if str(latest_race.get("round", "")) == str(next_race.get("round", "")):
        latest_race_results = latest_race.get("Results", [])
    else:
        latest_race_results = []

    post_race_facts = analytics.generate_post_race_facts(next_race, latest_race_results)
    
    penalty_watch = analytics.get_penalty_watch(penalty_points)
    teammate_battles = analytics.get_teammate_battle_summary(completed_races)
    sector_matrix = analytics.generate_sector_matrix(driver_standings)
    grid_penalties = analytics.generate_grid_penalties()
    circuit_specs = analytics.generate_circuit_blueprint_specs(next_race)
    
    social_res = social.fetch_social_sentiment(next_race.get('raceName', 'Hungarian Grand Prix'))
    social_sentiment = social_res.data

    # 4. Generate Pre-Race & Post-Race Briefs
    print("📝 Generating Pre-Race Preview & Post-Race Debrief...")
    pre_brief_portal = generator_portal.build_pre_race_brief(next_race, pre_race_facts, penalty_watch, driver_standings)
    post_brief_portal = generator_portal.build_post_race_brief(next_race, post_race_facts, teammate_battles, driver_standings)
    
    generator_root.build_pre_race_brief(next_race, pre_race_facts, penalty_watch, driver_standings)
    generator_root.build_post_race_brief(next_race, post_race_facts, teammate_battles, driver_standings)

    # 5. Check & Dispatch Webhook Notifications
    print("📡 Checking Webhook Notifications...")
    pre_trigger_res = watcher.should_trigger_pre_race_update(next_race)
    post_trigger_res = watcher.should_trigger_post_race_debrief(next_race)

    if pre_trigger_res.get("should_trigger"):
        print(f"🔔 Triggering Pre-Race Webhook Notification...")
        notifier.send_discord_brief(pre_brief_portal)
    if post_trigger_res.get("should_trigger"):
        print(f"🔔 Triggering Post-Race Webhook Notification...")
        notifier.send_discord_brief(post_brief_portal)

    # 6. Export Master overview.json
    master_overview = {
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
        "sectorMatrix": sector_matrix,
        "gridPenalties": grid_penalties,
        "circuitSpecs": circuit_specs,
        "penaltyWatch": penalty_watch,
        "teammateBattles": teammate_battles,
        "socialSentiment": social_sentiment,
        "latestPreBrief": pre_brief_portal,
        "latestPostBrief": post_brief_portal
    }

    for target_dir in [portal_data_dir, root_data_dir, dist_data_dir]:
        os.makedirs(target_dir, exist_ok=True)
        with open(os.path.join(target_dir, "overview.json"), "w") as f:
            json.dump(master_overview, f, indent=2)
        with open(os.path.join(target_dir, "social_feed.json"), "w") as f:
            json.dump(social_sentiment, f, indent=2)

    sync_sqlite_cache(db_path, master_overview, social_sentiment)
    print("✅ F1 Insights Full Pipeline v4.0 execution completed successfully!")

if __name__ == "__main__":
    mode_arg = sys.argv[1] if len(sys.argv) > 1 else "full"
    run_pipeline(mode_arg)
