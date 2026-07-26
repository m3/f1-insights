"""
Session Watcher & Automatic Trigger Module.
Monitors F1 session timings (FP1, FP2, FP3, Quali, Sprint, Race) and calculates exact trigger rules:
1. Post-Race Debrief: Triggers at Race End + 45 min.
2. Pre-Race Preview: Updates before FP1 and post-FP1, post-FP2, post-FP3, post-Sprint, and post-Qualifying.
"""
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

logger = logging.getLogger("SessionWatcher")
TRACING_REPO_COMMITS_URL = "https://api.github.com/repos/TracingInsights/2026/commits"

class SessionWatcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "F1-SessionWatcher/4.0"})

    def parse_session_dt(self, sess: Dict[str, Any]) -> Optional[datetime]:
        if not sess or not sess.get("date"):
            return None
        try:
            date_str = sess.get("date")
            time_str = sess.get("time", "00:00:00Z").replace("Z", "")
            return datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
        except Exception:
            return None

    def should_trigger_post_race_debrief(self, race_info: Dict[str, Any], current_dt: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Rule: Post-race debrief triggers after race end + 45 min.
        Assuming average Grand Prix duration of 2 hours, race end + 45 min = Race Start + 2h 45m.
        """
        now = current_dt or datetime.utcnow()
        race_sess = {"date": race_info.get("date"), "time": race_info.get("time")}
        race_start = self.parse_session_dt(race_sess)
        
        if not race_start:
            return {"should_trigger": False, "reason": "Missing race start time"}

        # Est Race End = start + 2 hours; Trigger = Est Race End + 45 min = start + 165 min
        trigger_time = race_start + timedelta(minutes=165)
        is_triggered = now >= trigger_time and now <= (trigger_time + timedelta(hours=12))

        return {
            "should_trigger": is_triggered,
            "race_start_time": race_start.isoformat() + "Z",
            "debrief_trigger_time": trigger_time.isoformat() + "Z",
            "current_time": now.isoformat() + "Z",
            "rule": "Post-Race Debrief triggers at Race End + 45 minutes"
        }

    def should_trigger_pre_race_update(self, race_info: Dict[str, Any], current_dt: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Rule: Pre-race needs to update before first FP1 and after every FP (FP1, FP2, FP3), Sprint, or Qualification.
        """
        now = current_dt or datetime.utcnow()
        sessions = [
            ("FP1", race_info.get("FirstPractice")),
            ("FP2", race_info.get("SecondPractice")),
            ("FP3", race_info.get("ThirdPractice")),
            ("Sprint Quali", race_info.get("SprintQualifying")),
            ("Sprint", race_info.get("Sprint")),
            ("Qualifying", race_info.get("Qualifying"))
        ]

        active_triggers = []
        fp1_dt = self.parse_session_dt(race_info.get("FirstPractice"))
        
        # 1. Before FP1 Window (2 hours prior to FP1 start)
        if fp1_dt:
            pre_fp1_window_start = fp1_dt - timedelta(hours=2)
            if pre_fp1_window_start <= now < fp1_dt:
                active_triggers.append({
                    "session": "Pre-FP1",
                    "trigger_type": "BEFORE_FP1",
                    "window_start": pre_fp1_window_start.isoformat() + "Z"
                })

        # 2. After Every Practice / Sprint / Qualifying (Session Start + 1 hour session duration + 45 min buffer = Start + 105 min)
        for name, sess in sessions:
            sess_dt = self.parse_session_dt(sess)
            if not sess_dt:
                continue
            
            post_sess_trigger = sess_dt + timedelta(minutes=105)
            # Active trigger window: trigger_time to trigger_time + 30 min
            if post_sess_trigger <= now <= (post_sess_trigger + timedelta(minutes=60)):
                active_triggers.append({
                    "session": name,
                    "trigger_type": "POST_SESSION_45MIN",
                    "session_start": sess_dt.isoformat() + "Z",
                    "trigger_time": post_sess_trigger.isoformat() + "Z"
                })

        return {
            "should_trigger": len(active_triggers) > 0,
            "active_triggers": active_triggers,
            "current_time": now.isoformat() + "Z",
            "rule": "Updates before FP1 and 45min after FP1/FP2/FP3/Sprint/Qualifying"
        }

    def check_tracing_insights_updated(self, last_known_commit_sha: Optional[str] = None) -> Dict[str, Any]:
        """Poll TracingInsights GitHub API to detect if new session data has been committed."""
        try:
            res = self.session.get(TRACING_REPO_COMMITS_URL, timeout=10)
            if res.status_code == 200:
                commits = res.json()
                if commits and len(commits) > 0:
                    latest_sha = commits[0].get("sha")
                    commit_msg = commits[0].get("commit", {}).get("message", "")
                    commit_date = commits[0].get("commit", {}).get("author", {}).get("date", "")

                    has_new_data = (last_known_commit_sha is not None) and (latest_sha != last_known_commit_sha)

                    return {
                        "has_new_data": has_new_data,
                        "latest_sha": latest_sha,
                        "commit_message": commit_msg,
                        "commit_date": commit_date,
                        "status": "CHECK_OK"
                    }
        except Exception as e:
            logger.warning(f"Error checking TracingInsights commits API: {e}")

        return {
            "has_new_data": False,
            "latest_sha": last_known_commit_sha,
            "status": "CHECK_FAILED"
        }

    def get_upcoming_checkpoint(self, race_info: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates exact session schedules and trigger rules."""
        now = datetime.utcnow()
        post_race_check = self.should_trigger_post_race_debrief(race_info, now)
        pre_race_check = self.should_trigger_pre_race_update(race_info, now)

        return {
            "raceName": race_info.get("raceName"),
            "postRaceDebriefRule": post_race_check,
            "preRaceUpdateRule": pre_race_check
        }
