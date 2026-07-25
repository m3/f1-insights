"""
Session Watcher & Automatic Trigger Module.
Monitors F1 session timings (FP1, FP2, FP3, Quali, Sprint, Race) and polls
TracingInsights GitHub repositories for fresh session data commits.
"""
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

logger = logging.getLogger("SessionWatcher")

TRACING_REPO_COMMITS_URL = "https://api.github.com/repos/TracingInsights/2026/commits"

class SessionWatcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "F1-SessionWatcher/1.0"})

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
        """Calculates exact upcoming or recently finished session checkpoint time."""
        sessions = [
            ("FP1", race_info.get("FirstPractice")),
            ("FP2", race_info.get("SecondPractice")),
            ("FP3", race_info.get("ThirdPractice")),
            ("Sprint Quali", race_info.get("SprintQualifying")),
            ("Sprint", race_info.get("Sprint")),
            ("Qualifying", race_info.get("Qualifying")),
            ("Race", {"date": race_info.get("date"), "time": race_info.get("time")})
        ]

        now = datetime.utcnow()
        checkpoints = []

        for name, sess in sessions:
            if not sess or not sess.get("date"):
                continue
            
            try:
                date_str = sess.get("date")
                time_str = sess.get("time", "00:00:00Z").replace("Z", "")
                dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")

                # Expected data upload buffer (+45 mins after session start/finish)
                upload_ready_time = dt + timedelta(minutes=90)
                
                checkpoints.append({
                    "sessionName": name,
                    "startTime": dt.isoformat() + "Z",
                    "expectedDataReady": upload_ready_time.isoformat() + "Z",
                    "isPast": now >= upload_ready_time
                })
            except Exception:
                pass

        return {
            "raceName": race_info.get("raceName"),
            "checkpoints": checkpoints
        }
