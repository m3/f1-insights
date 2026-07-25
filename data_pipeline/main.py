"""
Main Entry point for F1 Insights Pipeline.
Pulls latest F1 & TracingInsights data, runs analytics, generates briefings,
dispatches webhooks, and updates the web portal data store.
"""
import os
import sys
import json
from datetime import datetime
from fetchers.tracing_insights import F1DataFetcher
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

def run_pipeline():
    print("🚀 Starting F1 Insights Data Pipeline...")
    
    # 1. Initialize fetcher, analytics & notifier
    fetcher = F1DataFetcher()
    analytics = F1AnalyticsEngine()
    notifier = F1Notifier()
    
    # Paths to export JSON
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    portal_data_dir = os.path.join(base_dir, "portal", "public", "data")
    root_data_dir = os.path.join(base_dir, "public", "data")
    
    os.makedirs(portal_data_dir, exist_ok=True)
    os.makedirs(root_data_dir, exist_ok=True)

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

    # 6. Export master dataset for portal
    portal_master = {
        "updatedAt": datetime.now().isoformat(),
        "currentRace": next_race,
        "schedule": schedule,
        "driverStandings": driver_standings,
        "constructorStandings": constructor_standings,
        "penaltyPoints": penalty_points,
        "teammateBattles": teammate_battles,
        "socialSentiment": social_sentiment,
        "telemetryTraces": telemetry_traces,
        "latestPreBrief": pre_brief,
        "latestPostBrief": post_brief
    }

    for target_dir in [portal_data_dir, root_data_dir]:
        with open(os.path.join(target_dir, "overview.json"), "w") as f:
            json.dump(portal_master, f, indent=2)

    print("✅ F1 Insights Pipeline execution completed successfully!")

if __name__ == "__main__":
    run_pipeline()
