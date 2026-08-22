"""
F1 Insights & TracingInsights Data Pipeline v4.0.
Fetches live Formula 1 session schedules, WDC/WCC standings, race results, FastF1 lap telemetry,
OpenMeteo track weather, and multi-source social sentiment feeds.
Generates canonical overview.json, social_feed.json, and SQLite database caches.
"""
import os
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

# Ensure project root, backend dir, and pipeline dir are in sys.path
pipeline_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(pipeline_dir, ".."))
backend_dir = os.path.join(project_root, "backend")

for path in [project_root, backend_dir, pipeline_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

from providers.jolpica_provider import JolpicaProvider
from providers.fastf1_provider import FastF1Provider
from providers.openmeteo_provider import OpenMeteoProvider
from providers.social_provider import SocialProvider

from fetchers.tracing_insights import F1DataFetcher
from fetchers.tracing_reader import TracingInsightsReader
from fetchers.session_watcher import SessionWatcher
from analytics.telemetry import F1AnalyticsEngine
from generators.brief_generator import BriefGenerator
from generators.notifier import F1Notifier
from pipeline_common import (
    build_core_overview, build_telemetry_data, build_strategy_data,
    sync_caches_to_db, NotificationTrigger,
)

def find_target_race(schedule: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Find the target active Grand Prix (defaults to Hungarian Grand Prix if active)."""
    now_str = datetime.utcnow().strftime("%Y-%m-%d")
    for race in schedule:
        if race.get("date", "") >= now_str:
            return race
    return schedule[-1] if schedule else {}

async def run_pipeline(mode: str = "full"):
    """Execute the data pipeline in 'full' or 'social' mode."""
    base_pipeline_dir = os.path.dirname(os.path.abspath(__file__))
    portal_data_dir = os.path.join(base_pipeline_dir, "..", "portal", "public", "data")
    root_data_dir = os.path.join(base_pipeline_dir, "..", "public", "data")
    dist_data_dir = os.path.join(base_pipeline_dir, "..", "portal", "dist", "data")

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

    # 1. Initialize fetchers, TracingInsights reader, analytics & notifier
    fetcher = F1DataFetcher()
    tracing = TracingInsightsReader()
    watcher = SessionWatcher()
    notifier = F1Notifier()

    # Pull latest TracingInsights data if cloned locally (non-blocking fallback to direct CDN)
    print("📡 Initializing zero-waste TracingInsights data reader...")
    try:
        tracing.pull_latest()
    except Exception:
        pass

    analytics = F1AnalyticsEngine(tracing_reader=tracing)

    generator_portal = BriefGenerator(output_dir=portal_data_dir)
    generator_root = BriefGenerator(output_dir=root_data_dir)

    # 2. Fetch schedule, standings & completed race results via Jolpica Provider
    print("📥 Fetching current season calendar, standings & completed race results via JolpicaProvider...")
    sched_res = await jolpica.fetch_schedule()
    schedule = sched_res.data if sched_res.data else fetcher.get_current_schedule()

    wdc_res = await jolpica.fetch_driver_standings()
    driver_standings = wdc_res.data if wdc_res.data else fetcher.get_fallback_driver_standings()

    wcc_res = await jolpica.fetch_constructor_standings()
    constructor_standings = wcc_res.data if wcc_res.data else fetcher.get_fallback_constructor_standings()

    results_res = await jolpica.fetch_race_results()
    completed_races = results_res.data if results_res.data else []

    penalty_points = fetcher.get_penalty_points()

    # Dynamic target race selection
    next_race = find_target_race(schedule)
    race_name = next_race.get('raceName', '')
    print(f"🏎️ Target Grand Prix Weekend: {race_name} ({next_race.get('date')})")

    # Check what sessions TracingInsights has for this race
    ti_sessions = tracing.get_available_sessions(race_name)
    print(f"   TracingInsights sessions available: {ti_sessions}")

    # Fetch weather: prefer TracingInsights actual session data, fallback to OpenMeteo forecast
    ti_weather = tracing.build_session_weather_summary(race_name, "Race")
    if ti_weather:
        circuit_weather = ti_weather
        print(f"   🌡️ Using TracingInsights actual session weather (Track: {ti_weather.get('trackTemp')})")
    else:
        circuit = next_race.get('Circuit', {})
        lat = float(circuit.get('Location', {}).get('lat', 47.583))
        lng = float(circuit.get('Location', {}).get('long', 19.248))
        weather_res = await openmeteo.fetch_weather(lat=lat, lon=lng, circuit_name=circuit.get('circuitName', 'Circuit'))
        circuit_weather = weather_res.data
        print(f"   🌤️ Using OpenMeteo forecast weather")

    # Session checkpoints & GitHub updates check
    session_checkpoints = watcher.get_upcoming_checkpoint(next_race)

    # 3. Analytics from TracingInsights + Jolpica
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
    sector_matrix = analytics.generate_sector_matrix(race_name=race_name)
    grid_penalties = analytics.generate_grid_penalties(race_name=race_name)
    circuit_specs = analytics.generate_circuit_blueprint_specs(next_race)
    tyre_strategy = analytics.build_tyre_strategy_summary(race_name=race_name)
    pit_stops = analytics.build_pit_strategy(race_name=race_name)

    print(f"   📊 Sector Matrix: {len(sector_matrix)} drivers")
    print(f"   ⚖️ Penalties: {len(grid_penalties.get('startingGridImpacts', []))} grid, {len(grid_penalties.get('inRaceTimePenalties', []))} in-race")
    print(f"   🏎️ Tyre Strategy: {len(tyre_strategy)} lap entries")
    print(f"   🔧 Pit Stops: {len(pit_stops)} stops")
    
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
    macro_state = watcher.determine_macro_state(next_race)

    # 6. Export Chunked Payloads for Scalability
    core_overview = build_core_overview(
        next_race, circuit_weather, schedule, driver_standings, constructor_standings,
        pre_brief_portal, post_brief_portal, teammate_battles, macro_state,
        tracing.get_latest_commit_sha(), ti_sessions
    )
    telemetry_data = build_telemetry_data(sector_matrix, circuit_specs)
    strategy_data = build_strategy_data(grid_penalties, penalty_watch, tyre_strategy, pit_stops)

    for target_dir in [portal_data_dir, root_data_dir, dist_data_dir]:
        os.makedirs(target_dir, exist_ok=True)
        with open(os.path.join(target_dir, "overview.json"), "w") as f:
            json.dump(core_overview, f, indent=2)
        with open(os.path.join(target_dir, "telemetry.json"), "w") as f:
            json.dump(telemetry_data, f, indent=2)
        with open(os.path.join(target_dir, "strategy.json"), "w") as f:
            json.dump(strategy_data, f, indent=2)
        with open(os.path.join(target_dir, "social_feed.json"), "w") as f:
            json.dump(social_sentiment, f, indent=2)

    sync_caches_to_db(core_overview, telemetry_data, strategy_data, social_sentiment)
    NotificationTrigger().dispatch_if_due(
        macro_state, race_name, pre_brief_portal, post_brief_portal,
        notifier.send_discord_brief
    )
    print("✅ F1 Insights Full Pipeline v5.0 execution completed successfully (Chunked Payloads)!")

if __name__ == "__main__":
    mode_arg = "full"
    if len(sys.argv) > 1:
        raw_arg = sys.argv[1]
        if raw_arg == "social" or raw_arg == "--mode=social":
            mode_arg = "social"
        elif raw_arg.startswith("--mode="):
            mode_arg = raw_arg.split("=", 1)[1]
        else:
            mode_arg = raw_arg
    import asyncio
    asyncio.run(run_pipeline(mode_arg))
