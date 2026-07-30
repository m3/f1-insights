"""
Domain models for F1 Insights Platform (v2026.10).
Provides strongly typed Pydantic V2 schemas for motorsport entity graph traversals:
Driver -> Stint -> Lap -> Sector -> Telemetry.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DomainSector(BaseModel):
    sector_number: int = Field(..., description="Sector number (1, 2, or 3)")
    time_seconds: float = Field(..., description="Sector split time in seconds")
    is_personal_best: bool = Field(False, description="Whether sector time is driver's personal best")
    is_session_best: bool = Field(False, description="Whether sector time is session purple best")

class DomainLap(BaseModel):
    lap_number: int = Field(..., description="Lap number in session")
    lap_time_seconds: float = Field(..., description="Total lap time in seconds")
    compound: str = Field(..., description="Tyre compound type (SOFT, MEDIUM, HARD, INTERMEDIATE, WET)")
    stint_number: int = Field(..., description="Stint sequence number")
    gap_to_car_ahead_seconds: Optional[float] = Field(None, description="Gap to preceding car in seconds")
    is_pit_out_lap: bool = Field(False, description="Whether lap is out-lap from pit stop")
    is_pit_in_lap: bool = Field(False, description="Whether lap is in-lap to pit stop")
    is_safety_car_lap: bool = Field(False, description="Whether lap was under Safety Car / VSC")
    sectors: List[DomainSector] = Field(default_factory=list, description="Sector split times")

    def is_clear_air(self, min_gap: float = 1.0) -> bool:
        """Evaluate if lap meets clear-air criteria (> min_gap and non-SC/pit)."""
        if self.is_pit_out_lap or self.is_pit_in_lap or self.is_safety_car_lap:
            return False
        if self.gap_to_car_ahead_seconds is None:
            return True
        return self.gap_to_car_ahead_seconds >= min_gap

class DomainStint(BaseModel):
    stint_number: int = Field(..., description="Stint sequence number")
    compound: str = Field(..., description="Tyre compound used")
    start_lap: int = Field(..., description="Starting lap of stint")
    end_lap: int = Field(..., description="Ending lap of stint")
    total_laps: int = Field(..., description="Total laps completed on stint")
    laps: List[DomainLap] = Field(default_factory=list, description="Lap records in stint")

    def get_clear_air_laps(self, min_gap: float = 1.0) -> List[DomainLap]:
        """Return array of laps satisfying clear-air filtering criteria."""
        return [lap for lap in self.laps if lap.is_clear_air(min_gap)]

    def compute_degradation_slope(self) -> float:
        """Compute estimated lap time degradation slope (seconds per lap)."""
        clear_laps = self.get_clear_air_laps()
        if len(clear_laps) < 3:
            return 0.0
        times = [lap.lap_time_seconds for lap in clear_laps]
        # Simple slope estimate between final and initial clear lap averages
        delta = times[-1] - times[0]
        return delta / (len(times) - 1)

class DomainDriver(BaseModel):
    driver_id: str = Field(..., description="Unique driver ID (e.g. 'norris')")
    code: str = Field(..., description="3-letter driver code (e.g. 'NOR')")
    number: int = Field(..., description="Permanent driver racing number")
    given_name: str = Field(..., description="Driver given name")
    family_name: str = Field(..., description="Driver family name")
    team_name: str = Field(..., description="Constructor / team name")
    stints: List[DomainStint] = Field(default_factory=list, description="Stint records")

    def get_total_laps_completed(self) -> int:
        """Return total laps completed across all stints."""
        return sum(stint.total_laps for stint in self.stints)
