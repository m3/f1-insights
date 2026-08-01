import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

logger = logging.getLogger("SessionWatcher")
TRACING_REPO_COMMITS_URL = "https://api.github.com/repos/TracingInsights/2026/commits"

class SessionWatcher:
    """
    Session Watcher & Automatic Trigger Module.
    Evaluates the macro state of the F1 weekend.
    Macro States: PRE_WEEKEND, SESSION_IN_PROGRESS, POST_SESSION
    """
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

    def determine_macro_state(self, race_info: Dict[str, Any], current_dt: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Determines the current macro state and session status.
        """
        now = current_dt or datetime.utcnow()
        
        format = "standard"
        if "Sprint" in race_info or "SprintQualifying" in race_info:
            format = "sprint"
            
        sessions = []
        if format == "sprint":
            sessions = [
                ("FP1", race_info.get("FirstPractice")),
                ("SprintQuali", race_info.get("SprintQualifying") or race_info.get("SecondPractice")),
                ("SprintRace", race_info.get("Sprint")),
                ("MainQuali", race_info.get("Qualifying")),
                ("MainRace", {"date": race_info.get("date"), "time": race_info.get("time")})
            ]
        else:
            sessions = [
                ("FP1", race_info.get("FirstPractice")),
                ("FP2", race_info.get("SecondPractice")),
                ("FP3", race_info.get("ThirdPractice")),
                ("MainQuali", race_info.get("Qualifying")),
                ("MainRace", {"date": race_info.get("date"), "time": race_info.get("time")})
            ]
            
        parsed_sessions = []
        for name, sess in sessions:
            if sess and isinstance(sess, dict) and sess.get("date"):
                dt = self.parse_session_dt(sess)
                if dt:
                    parsed_sessions.append({"name": name, "start": dt})
                    
        parsed_sessions = sorted(parsed_sessions, key=lambda x: x["start"])
        
        if not parsed_sessions:
            return {
                "format": format,
                "macroState": "PRE_WEEKEND",
                "sessionType": None,
                "dataStatus": "STALE",
                "lastUpdatedUtc": now.isoformat() + "Z"
            }
            
        if now < parsed_sessions[0]["start"]:
            return {
                "format": format,
                "macroState": "PRE_WEEKEND",
                "sessionType": None,
                "dataStatus": "STALE",
                "lastUpdatedUtc": now.isoformat() + "Z",
                "nextSession": {
                    "name": parsed_sessions[0]["name"],
                    "timeUtc": parsed_sessions[0]["start"].isoformat() + "Z"
                }
            }
            
        current_session = None
        for i in range(len(parsed_sessions)):
            sess = parsed_sessions[i]
            
            # Dynamic buffer based on session type
            s_name = sess["name"].lower()
            if "mainrace" in s_name:
                duration_mins = 150
            elif "sprintrace" in s_name:
                duration_mins = 60
            elif "quali" in s_name:
                duration_mins = 90
            else:
                duration_mins = 90
                
            end_buffer = sess["start"] + timedelta(minutes=duration_mins)
            
            if sess["start"] <= now <= end_buffer:
                return {
                    "format": format,
                    "macroState": "SESSION_IN_PROGRESS",
                    "sessionType": sess["name"],
                    "dataStatus": "LIVE",
                    "lastUpdatedUtc": now.isoformat() + "Z"
                }
            
            if now > end_buffer:
                current_session = sess
                
        if current_session:
            return {
                "format": format,
                "macroState": "POST_SESSION",
                "sessionType": current_session["name"],
                "dataStatus": "PROCESSING",
                "lastUpdatedUtc": now.isoformat() + "Z"
            }

        return {
            "format": format,
            "macroState": "UNKNOWN",
            "sessionType": None,
            "dataStatus": "STALE",
            "lastUpdatedUtc": now.isoformat() + "Z"
        }

    # Keep backwards compatibility for old main.py methods
    def check_tracing_insights_updated(self, last_known_commit_sha: Optional[str] = None) -> Dict[str, Any]:
        return {"has_new_data": False, "status": "CHECK_FAILED"}

    def get_upcoming_checkpoint(self, race_info: Dict[str, Any]) -> Dict[str, Any]:
        return self.determine_macro_state(race_info)
