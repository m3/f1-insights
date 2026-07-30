import React from 'react';
import { Gauge, ShieldCheck, Zap, Info } from 'lucide-react';

export default function StrategicAdvantageCard({
  driverCode = "NOR",
  driverName = "Lando Norris",
  spiScore = 84.5,
  confidence = "HIGH",
  breakdown = {
    tyreLifeScore: 90.0,
    cleanAirScore: 80.0,
    pitWindowScore: 85.0,
    degSlopeScore: 82.0
  },
  formula = "0.35*TyreLife + 0.25*CleanAir + 0.25*PitWindow + 0.15*DegSlope"
}) {
  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid var(--gold-warning)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gauge color="var(--gold-warning)" size={22} />
          <div>
            <h3 className="font-orbitron" style={{ fontSize: '1.1rem', color: '#FFF', margin: 0 }}>
              Strategic Position Index (SPI) • {driverName} ({driverCode})
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Composite strategic advantage rating evaluating tyre age, traffic gap, and pit window.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'rgba(0, 229, 255, 0.15)',
            color: 'var(--cyan-neon)',
            border: '1px solid rgba(0, 229, 255, 0.3)'
          }}>
            CONFIDENCE: {confidence}
          </span>
          <div className="font-orbitron font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold-warning)' }}>
            {spiScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Component Breakdown Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '14px' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Tyre Life Delta (35%)</div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>{breakdown.tyreLifeScore}</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Clean Air Gap (25%)</div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cyan-neon)', marginTop: '4px' }}>{breakdown.cleanAirScore}</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pit Window (25%)</div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34D399', marginTop: '4px' }}>{breakdown.pitWindowScore}</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Deg Slope (15%)</div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>{breakdown.degSlopeScore}</div>
        </div>
      </div>

      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Info size={12} color="var(--text-dim)" /> Formula: <code style={{ color: 'var(--cyan-neon)' }}>{formula}</code>
      </div>
    </div>
  );
}
