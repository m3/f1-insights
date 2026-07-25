"""
Main Entry point for F1 Insights Pipeline.
Pulls latest F1 & TracingInsights data, runs analytics, generates briefings,
dispatches webhooks, and updates the web portal data store.

Modes:
  python main.py                # Full pipeline (telemetry, standings, briefs, social)
  python main.py --mode=social  # Fast lightweight social feed update (X & YouTube)
"""
import os
import sys
import json
from datetime import datetime
from fetchers.tracing_insights import F1DataFetcher
from fetchers.session_watcher import SessionWatcher
from analytics.telemetry import F1AnalyticsEngine
from analytics.sentiment import F1SentimentEngine
from generators.brief_generator import BriefGenerator
from generators.notifier import F1Notifier

def find_target_race(schedule: list) -> dict:
    """Dynamically select the upcoming or most recent Grand Prix based on today's date."""
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    upcoming_races = [r for r in schedule if r.get("date", "") >= today_str]
    if upcoming_races:
        return upcoming_races[0]
    
    return schedule[-1] if schedule else {}

def run_pipeline(mode: str = "full"):
    print(f"🚀 Starting F1 Insights Data Pipeline (Mode: {mode.upper()})...")
    
    # Paths to export JSON
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    portal_data_dir = os.path.join(base_dir, "portal", "public", "data")
    root_data_dir = os.path.join(base_dir, "public", "data")
    
    os.makedirs(portal_data_dir, exist_ok=True)
    os.makedirs(root_data_dir, exist_ok=True)

    if mode == "social":
        print("⚡ Running fast X (Twitter) & YouTube social feed update...")
        social_sentiment = F1SentimentEngine.get_race_sentiment_summary("Hungarian Grand Prix")
        
        # Partial update of overview.json
        overview_path = os.path.join(portal_data_dir, "overview.json")
        if os.path.exists(overview_path):
            with open(overview_path, "r") as f:
                data = json.load(f)
            data["socialSentiment"] = social_sentiment
            data["updatedAt"] = datetime.now().isoformat()
            
            for target_dir in [portal_data_dir, root_data_dir]:
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

    # 2. Fetch schedule & standings
    print("📥 Fetching current season calendar & standings...")
    schedule = fetcher.get_current_schedule()
    driver_standings = fetcher.get_driver_standings()
    constructor_standings = fetcher.get_constructor_standings()
    penalty_points = fetcher.get_penalty_points()

    # Dynamic target race selection
    next_race = find_target_race(schedule)
    print(f"🏎️ Target Grand Prix Weekend: {next_race.get('raceName')} ({next_race.get('date')})")

    # Session checkpoints & GitHub updates check
    session_checkpoints = watcher.get_upcoming_checkpoint(next_race)
    tracing_commit_status = watcher.check_tracing_insights_updated()

    # 3. Analytics & Telemetry Traces
    pre_race_facts = analytics.generate_pre_race_facts(next_race, driver_standings)
    post_race_facts = analytics.generate_post_race_facts(next_race)
    penalty_watch = analytics.get_penalty_watch(penalty_points)
    teammate_battles = analytics.get_teammate_battle_summary()
    social_sentiment = F1SentimentEngine.get_race_sentiment_summary(next_race.get('raceName', ''))
    telemetry_traces = analytics.generate_telemetry_traces()

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

    # 6. Export master dataset for portal & SQLite database
    portal_master = {
        "updatedAt": datetime.now().isoformat(),
        "currentRace": next_race,
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

    for target_dir in [portal_data_dir, root_data_dir]:
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
        except ImportError:
            from app.core.database import SessionLocal, engine, Base
            from app.db.models import MasterOverviewCache

        Base.metadata.create_all(bind=engine)

        db = SessionLocal()
        existing = db.query(MasterOverviewCache).filter(MasterOverviewCache.id == "latest").first()
        if existing:
            existing.payload_json = serialized_json
        else:
            db.add(MasterOverviewCache(id="latest", payload_json=serialized_json))
        db.commit()
        db.close()
        print("💾 Synced master overview to SQLite database (f1_insights.db)")
    except Exception as e:
        print(f"Notice: SQLite DB sync skipped ({e})")

    print("✅ F1 Insights Full Pipeline execution completed successfully!")

if __name__ == "__main__":
    mode_arg = "full"
    for arg in sys.argv[1:]:
        if arg.startswith("--mode="):
            mode_arg = arg.split("=")[1]
    run_pipeline(mode=mode_arg)
