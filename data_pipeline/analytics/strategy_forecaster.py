"""
Strategic Position Index Live Forecaster Module for F1 Insights Platform (v2026.10).
Extrapolates lap time degradation decay and Safety Car pit window cushions to forecast race outcomes.
"""
from typing import Dict, List, Any, Optional

class StrategyForecaster:
    @staticmethod
    def forecast_green_flag_outcome(
        driver_a: Dict[str, Any],
        driver_b: Dict[str, Any],
        laps_remaining: int
    ) -> Dict[str, Any]:
        """
        Forecast green flag finish winner between two drivers using lap degradation extrapolation.
        Answers Question STRAT-04: 'If the race stays green, who wins?'
        """
        code_a = driver_a.get("code", "DRIVER_A")
        code_b = driver_b.get("code", "DRIVER_B")
        
        gap_a_to_b = float(driver_a.get("gapToCarBehindSeconds", 0.0))
        pace_a = float(driver_a.get("meanPaceSeconds", 80.0))
        pace_b = float(driver_b.get("meanPaceSeconds", 80.0))
        deg_a = float(driver_a.get("degSlopePerLap", 0.05))
        deg_b = float(driver_b.get("degSlopePerLap", 0.05))

        # Extrapolate cumulative time across remaining laps
        cum_a = sum(pace_a + (i * deg_a) for i in range(laps_remaining))
        cum_b = sum(pace_b + (i * deg_b) for i in range(laps_remaining))

        # Driver A starts with initial advantage gap_a_to_b
        # Total time for A to complete remaining laps = cum_a
        # Total time for B to complete remaining laps = gap_a_to_b + cum_b
        # Remaining gap at finish for A = (gap_a_to_b + cum_b) - cum_a
        net_gap_at_finish = (gap_a_to_b + cum_b) - cum_a

        predicted_winner = code_a if net_gap_at_finish > 0 else code_b
        overtake_lap = None


        if predicted_winner == code_b and gap_a_to_b > 0:
            # Find lap where gap crosses zero
            current_gap = gap_a_to_b
            for lap_idx in range(1, laps_remaining + 1):
                lap_pace_a = pace_a + ((lap_idx - 1) * deg_a)
                lap_pace_b = pace_b + ((lap_idx - 1) * deg_b)
                # Pace difference: B is faster by (lap_pace_a - lap_pace_b)
                current_gap -= (lap_pace_a - lap_pace_b)
                if current_gap <= 0:
                    overtake_lap = lap_idx
                    break


        return {
            "driverA": code_a,
            "driverB": code_b,
            "lapsRemaining": laps_remaining,
            "predictedWinner": predicted_winner,
            "projectedMarginSeconds": round(abs(net_gap_at_finish), 2),
            "predictedOvertakeLap": overtake_lap,
            "summary": f"{predicted_winner} projected to win by {round(abs(net_gap_at_finish), 2)}s if race stays green."
        }

    @staticmethod
    def forecast_safety_car_beneficiaries(
        driver_positions: List[Dict[str, Any]],
        normal_pit_loss_seconds: float = 21.5,
        sc_pit_loss_seconds: float = 11.2
    ) -> Dict[str, Any]:
        """
        Identify drivers benefiting most from a Safety Car deployment within the next 5 laps.
        Answers Question STRAT-05: 'If Safety Car comes within 5 laps, who benefits?'
        """
        time_saved = normal_pit_loss_seconds - sc_pit_loss_seconds
        beneficiaries = []

        for d in driver_positions:
            code = d.get("code", "UNK")
            pos = d.get("position", 99)
            has_pitted = d.get("hasPitted", False)

            if not has_pitted:
                beneficiaries.append({
                    "driver": code,
                    "position": pos,
                    "pitTimeSavedSeconds": round(time_saved, 1),
                    "benefitCategory": "HIGH_BENEFIT" if pos <= 5 else "MODERATE_BENEFIT"
                })

        beneficiaries.sort(key=lambda x: x["position"])

        return {
            "beneficiaries": beneficiaries,
            "scPitTimeSavedSeconds": round(time_saved, 1),
            "summary": f"Drivers who have not pitted save {round(time_saved, 1)}s under Safety Car." if beneficiaries else "All top drivers have completed mandatory pit stop."
        }
