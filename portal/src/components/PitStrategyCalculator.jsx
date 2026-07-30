import React, { useState } from 'react';
import { Timer, Zap, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PitStrategyCalculator({ pitStopsData }) {
  const [currentGap, setCurrentGap] = useState(18.5);
  const [pitCondition, setPitCondition] = useState('green'); // 'green', 'vsc', 'sc'

  const pitStopsList = Array.isArray(pitStopsData) ? pitStopsData : [];

  // Pit Loss Times (Seconds lost traversing pit lane under different conditions)
  const pitLossTimes = {
    green: 21.8,
    vsc: 13.5,
    sc: 10.2
  };

  const currentLoss = pitLossTimes[pitCondition];
  const netDelta = currentGap - currentLoss;
  const emergesAhead = netDelta > 0;

  return (
    <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF1801', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
        <Timer size={16} /> Strategy & Pit Stop Loss Calculator
      </div>
      <h2 className="font-orbitron text-gradient-red" style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 20px' }}>
        Pit Loss & Undercut Window Calculator
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Left Inputs Panel */}
        <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF', marginBottom: '16px' }}>
            Interactive Strategy Parameters
          </h3>

          {/* Pit Condition Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
              Track Condition & Safety Car Status:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => setPitCondition('green')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: pitCondition === 'green' ? '1px solid #FF1801' : '1px solid var(--border-subtle)',
                  background: pitCondition === 'green' ? 'rgba(255, 24, 1, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: pitCondition === 'green' ? '#FFF' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                🟩 Green Flag (21.8s)
              </button>
              <button
                onClick={() => setPitCondition('vsc')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: pitCondition === 'vsc' ? '1px solid #EAB308' : '1px solid var(--border-subtle)',
                  background: pitCondition === 'vsc' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: pitCondition === 'vsc' ? '#FFF' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                🟨 VSC (13.5s)
              </button>
              <button
                onClick={() => setPitCondition('sc')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: pitCondition === 'sc' ? '1px solid #3B82F6' : '1px solid var(--border-subtle)',
                  background: pitCondition === 'sc' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                  color: pitCondition === 'sc' ? '#FFF' : 'var(--text-dim)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                🟦 Full SC (10.2s)
              </button>
            </div>
          </div>

          {/* Gap Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gap to Rival Driver:</span>
              <span className="font-orbitron" style={{ color: '#FF1801', fontWeight: 800 }}>{currentGap.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="35.0"
              step="0.5"
              value={currentGap}
              onChange={(e) => setCurrentGap(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#FF1801', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Right Output Prediction Panel */}
        <div style={{
          background: emergesAhead ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: emergesAhead ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {emergesAhead ? <ShieldCheck color="#22C55E" size={20} /> : <AlertTriangle color="#EF4444" size={20} />}
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: emergesAhead ? '#22C55E' : '#EF4444', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {emergesAhead ? 'CLEAR PIT RE-ENTRY WINDOW' : 'TRAFFIC & OVERCUT RISK'}
              </span>
            </div>

            <div className="font-orbitron" style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF', lineHeight: '1.1', marginBottom: '8px' }}>
              {emergesAhead ? `+${netDelta.toFixed(1)}s Ahead` : `${netDelta.toFixed(1)}s Behind`}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {emergesAhead
                ? `With a ${currentGap}s gap under ${pitCondition.toUpperCase()}, pitting now will allow re-entry ahead of the rival with a +${netDelta.toFixed(1)}s safety buffer.`
                : `A ${currentGap}s gap is insufficient for a ${currentLoss}s pit stop loss. Pitting now will drop the driver ${Math.abs(netDelta).toFixed(1)}s behind into traffic.`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pit Traversal Loss</div>
              <div className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF' }}>{currentLoss}s</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Strategy Option</div>
              <div className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#FF1801' }}>{pitCondition.toUpperCase()} OPTIMIZED</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
