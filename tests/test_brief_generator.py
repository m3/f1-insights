"""
Unit tests for data_pipeline/generators/brief_generator.py (F1 Insights v2026.10).
Proves EvidenceChainGenerator composite confidence scoring and 4-field schema formatting.
"""
import pytest
from data_pipeline.generators.brief_generator import EvidenceChainGenerator

def test_evidence_chain_confidence_formula():
    """Verify composite confidence calculation (0.40 Tel + 0.30 Tim + 0.20 Hist + 0.10 Wea)."""
    gen = EvidenceChainGenerator()
    score_full = gen.calculate_composite_confidence(True, True, True, True)
    assert score_full == 1.0

    score_partial = gen.calculate_composite_confidence(
        telemetry_present=True, timing_present=True, history_present=False, weather_present=False
    )
    assert score_partial == 0.70

def test_evidence_chain_payload_formatting():
    """Verify 4-field evidence explanation payload formatting."""
    gen = EvidenceChainGenerator()
    chain = gen.generate_evidence_chain(
        question="Why did Leclerc lose time in S2?",
        observation="Leclerc was 0.32s slower in S2 than Sainz.",
        evidence_items=["Speed trap: 312 km/h vs 318 km/h", "Throttle: 88% out of T7"],
        interpretation="Higher rear wing downforce angle caused straight-line drag penalty.",
        blind_spots=["ERS deployment map unobserved"],
        telemetry_present=True,
        timing_present=True,
        history_present=True,
        weather_present=False
    )

    assert chain["question"] == "Why did Leclerc lose time in S2?"
    assert chain["confidenceScore"] == 0.90
    assert chain["confidenceBand"] == "HIGH"
    assert chain["validationStatus"] == "Validated"
    assert len(chain["evidence"]) == 2
    assert len(chain["blindSpots"]) == 1
