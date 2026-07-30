import React, { useState } from 'react';
import { HelpCircle, Eye, Calculator, ChevronDown, ChevronUp, EyeOff } from 'lucide-react';

export default function EvidenceExplanationCard({
  question = "Why did Norris lose position to Verstappen during Laps 42-48?",
  observation = "Norris lost 4.3 seconds to Verstappen between Laps 42 and 48.",
  evidence = [
    "Tyre Compound & Age: Norris (Hard, 28 Laps) vs Verstappen (Medium, 12 Laps)",
    "Stint Lap Pace Slope: Norris +0.14s/lap degradation vs Verstappen -0.02s/lap",
    "Traffic Gap: Norris behind Stroll (Gap = 0.82s, DRS active L44-46)",
    "Pit Exit Delta: Verstappen gained +1.8s during out-lap window"
  ],
  interpretation = "The available evidence suggests tyre degradation and traffic obstruction contributed more to the pace delta than raw chassis performance.",
  confidence = "HIGH",
  validationStatus = "Validated",
  lastUpdated = "Lap 37 (14:22:05 UTC)",
  blindSpots = [
    "ERS Battery SOC is unobserved (estimated from straight-line speed traces)",
    "Fuel mass delta is unobserved (estimated from stint lap progression)"
  ]
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid var(--cyan-neon)' }}>
      {/* Header & Question */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HelpCircle color="var(--cyan-neon)" size={20} />
          <h3 className="font-orbitron" style={{ fontSize: '1.05rem', color: '#FFF', margin: 0 }}>
            {question}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(255, 176, 0, 0.15)',
            color: 'var(--gold-warning)',
            border: '1px solid rgba(255, 176, 0, 0.3)'
          }}>
            🟡 {validationStatus}
          </span>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(0, 229, 255, 0.15)',
            color: 'var(--cyan-neon)',
            border: '1px solid rgba(0, 229, 255, 0.3)'
          }}>
            CONFIDENCE: {confidence}
          </span>
        </div>
      </div>

      {/* 4-Field Schema Content */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Field 1: Observation */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Eye size={12} color="var(--cyan-neon)" /> 1. Observation (Direct Measurement)
          </div>
          <div style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: 600 }}>
            {observation}
          </div>
        </div>

        {/* Field 2: Evidence & Calculations */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Calculator size={12} color="var(--gold-warning)" /> 2. Evidence & Deterministic Calculations
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {evidence.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Field 3: Interpretation & Explanation */}
        <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--cyan-neon)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', marginBottom: '4px' }}>
            💡 3. Evidence-Backed Explanation
          </div>
          <div style={{ color: '#FFF', fontSize: '0.85rem', lineHeight: 1.4 }}>
            {interpretation}
          </div>
        </div>
      </div>

      {/* Expandable Field 4: Limitations & Blind Spots */}
      <div style={{ marginTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0
          }}
        >
          <EyeOff size={12} />
          {showDetails ? 'Hide Operational Limitations & Blind Spots' : 'Show Operational Limitations & Blind Spots'}
          {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showDetails && (
          <div style={{ marginTop: '10px', background: 'rgba(255, 69, 58, 0.05)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255, 69, 58, 0.15)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF453A', marginBottom: '4px', textTransform: 'uppercase' }}>
              🙈 Known Data Limitations & Blind Spots
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {blindSpots.map((bs, idx) => (
                <li key={idx}>{bs}</li>
              ))}
            </ul>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '8px' }}>
              Last Updated: {lastUpdated}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
