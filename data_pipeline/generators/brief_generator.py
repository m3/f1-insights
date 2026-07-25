"""
Brief Generator Module.
Formats race insights into clean Markdown, HTML Email/Discord payloads,
and JSON data files exported directly to the Web Portal public directory.
"""
import json
import os
from datetime import datetime
from typing import Dict, List, Any

class BriefGenerator:
    def __init__(self, output_dir: str = "../public/data"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def build_pre_race_brief(
        self,
        race: Dict[str, Any],
        facts: List[Dict[str, Any]],
        penalty_watch: Dict[str, Any],
        driver_standings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Construct the Pre-Race Morning Brief."""
        race_name = race.get("raceName", "Grand Prix")
        circuit_name = race.get("Circuit", {}).get("circuitName", "Circuit")
        date_str = race.get("date", "Upcoming Weekend")

        markdown_content = f"""# 🏎️ F1 PRE-RACE BRIEFING: {race_name.upper()}
**Location**: {circuit_name} | **Date**: {date_str}

---

### 📌 KEY WEEKEND HIGHLIGHTS & STRATEGY FORECAST
"""
        for fact in facts:
            markdown_content += f"""- **[{fact['badge']}] {fact['topic']}** (*{fact['stat']}*)
  {fact['detail']}\n\n"""

        markdown_content += f"""### ⚠️ DRIVER PENALTY & LICENSE WATCH
{penalty_watch.get('summary', '')}
"""
        for driver in penalty_watch.get("high_risk_drivers", []):
            markdown_content += f"- **{driver.get('driver')} ({driver.get('code')})**: {driver.get('points')}/12 Points | Expiry: {driver.get('expiry_next')}\n"

        markdown_content += """\n### 🏆 CURRENT CHAMPIONSHIP TOP 5\n"""
        for d in driver_standings[:5]:
            driver_obj = d.get("Driver", {})
            team = d.get("Constructors", [{}])[0].get("name", "")
            markdown_content += f"{d.get('position')}. **{driver_obj.get('givenName')} {driver_obj.get('familyName')}** ({team}) - {d.get('points')} Pts ({d.get('wins')} Wins)\n"

        brief_payload = {
            "type": "PRE_RACE",
            "title": f"Pre-Race Preview: {race_name}",
            "raceName": race_name,
            "circuitName": circuit_name,
            "date": date_str,
            "generatedAt": datetime.now().isoformat(),
            "facts": facts,
            "penaltyWatch": penalty_watch,
            "topStandings": driver_standings[:5],
            "markdown": markdown_content
        }

        # Export JSON to portal public directory
        with open(os.path.join(self.output_dir, "latest_pre_race_brief.json"), "w") as f:
            json.dump(brief_payload, f, indent=2)

        return brief_payload

    def build_post_race_brief(
        self,
        race: Dict[str, Any],
        facts: List[Dict[str, Any]],
        teammate_battles: List[Dict[str, Any]],
        driver_standings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Construct the Post-Race Debrief."""
        race_name = race.get("raceName", "Grand Prix")
        circuit_name = race.get("Circuit", {}).get("circuitName", "Circuit")
        date_str = race.get("date", "Recent Weekend")

        markdown_content = f"""# 🏁 F1 POST-RACE DEBRIEF: {race_name.upper()}
**Location**: {circuit_name} | **Date**: {date_str}

---

### 📊 TELEMETRY & STRATEGY RECAP
"""
        for fact in facts:
            markdown_content += f"""- **[{fact['badge']}] {fact['topic']}** (*{fact['stat']}*)
  {fact['detail']}\n\n"""

        markdown_content += """### ⚔️ TEAMMATE HEAD-TO-HEAD BATTLES\n"""
        for b in teammate_battles:
            markdown_content += f"- **{b['team']}** ({b['drivers']}): Quali `{b['quali']}` | Race `{b['race']}` -> Leader: **{b['leader']}**\n"

        brief_payload = {
            "type": "POST_RACE",
            "title": f"Post-Race Debrief: {race_name}",
            "raceName": race_name,
            "circuitName": circuit_name,
            "date": date_str,
            "generatedAt": datetime.now().isoformat(),
            "facts": facts,
            "teammateBattles": teammate_battles,
            "topStandings": driver_standings[:5],
            "markdown": markdown_content
        }

        # Export JSON to portal public directory
        with open(os.path.join(self.output_dir, "latest_post_race_brief.json"), "w") as f:
            json.dump(brief_payload, f, indent=2)

        return brief_payload
