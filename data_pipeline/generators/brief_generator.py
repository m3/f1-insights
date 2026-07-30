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


class EvidenceChainGenerator:
    """
    3-Tier Explainable AI Evidence Chain Generator.
    Produces structured evidence chains: Observation -> Calculations -> Interpretation with Confidence Rating.
    """
    @staticmethod
    def calculate_composite_confidence(
        telemetry_present: bool = True,
        timing_present: bool = True,
        history_present: bool = True,
        weather_present: bool = True
    ) -> float:
        """
        Calculate composite confidence score (0.0 to 1.0).
        Formula: 0.40 * Telemetry + 0.30 * Timing + 0.20 * History + 0.10 * Weather
        """
        score = (
            (0.40 if telemetry_present else 0.0) +
            (0.30 if timing_present else 0.0) +
            (0.20 if history_present else 0.0) +
            (0.10 if weather_present else 0.0)
        )
        return round(score, 2)

    def generate_evidence_chain(
        self,
        question: str,
        observation: str,
        evidence_items: List[str],
        interpretation: str,
        blind_spots: List[str],
        telemetry_present: bool = True,
        timing_present: bool = True,
        history_present: bool = True,
        weather_present: bool = True
    ) -> Dict[str, Any]:
        """Construct a standardized 4-Field Evidence Explanation payload."""
        conf_score = self.calculate_composite_confidence(
            telemetry_present, timing_present, history_present, weather_present
        )
        conf_band = "HIGH" if conf_score >= 0.80 else ("MODERATE" if conf_score >= 0.50 else "LIMITED")

        return {
            "question": question,
            "observation": observation,
            "evidence": evidence_items,
            "interpretation": interpretation,
            "confidenceScore": conf_score,
            "confidenceBand": conf_band,
            "validationStatus": "Validated" if conf_score >= 0.70 else "Inferred",
            "blindSpots": blind_spots,
            "generatedAt": datetime.utcnow().isoformat() + "Z"
        }

