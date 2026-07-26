import React, { useState } from 'react';
import { Timer, Zap, Sliders, Activity, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function TyreDegSimulator() {
  const [strategy, setStrategy] = useState('1stop'); // '1stop' or '2stop'
  const [softStint, setSoftStint] = useState(18);
  const [mediumStint, setMediumStint] = useState(24);
  const [hardStint, setHardStint] = useState(28);

  const compounds = {
    C4_SOFT: { name: "Soft (C4)", color: "#FF1801", basePace: 78.2, degPerLap: 0.125 },
    C3_MEDIUM: { name: "Medium (C3)", color: "#FFB800", basePace: 78.8, degPerLap: 0.065 },
    C2_HARD: { name: "Hard (C2)", color: "#FFFFFF", basePace: 79.4, degPerLap: 0.032 }
  };

  // Generate 70-lap simulation points for 1-stop vs 2-stop strategies
  const generateSimData = () => {
    const points = [];
    let pitLoss = 21.8; // Green flag pit loss

    // Strategy 1: Medium (L1-L26) -> Hard (L27-L70)
    let s1Pace = compounds.C3_MEDIUM.basePace;
    let s1TyreAge = 0;
    let s1Compound = "C3_MEDIUM";

    // Strategy 2: Soft (L1-L16) -> Medium (L17-L44) -> Soft (L45-L70)
    let s2Pace = compounds.C4_SOFT.basePace;
    let s2TyreAge = 0;
    let s2Compound = "C4_SOFT";

    let s1TotalTime = 0;
    let s2TotalTime = 0;

    for (let lap = 1; lap <= 70; lap++) {
      // Strategy 1 (1-Stop: Medium -> Hard at L26)
      if (lap === 26) {
        s1Pace += pitLoss; // Add pit stop loss
        s1Compound = "C2_HARD";
        s1TyreAge = 0;
      } else {
        s1Pace = compounds[s1Compound].basePace + (s1TyreAge * compounds[s1Compound].degPerLap);
        s1TyreAge++;
      }
      s1TotalTime += s1Pace;

      // Strategy 2 (2-Stop: Soft -> Medium at L16 -> Soft at L44)
      if (lap === 16) {
        s2Pace += pitLoss;
        s2Compound = "C3_MEDIUM";
        s2TyreAge = 0;
      } else if (lap === 44) {
        s2Pace += pitLoss;
        s2Compound = "C4_SOFT";
        s2TyreAge = 0;
      } else {
        s2Pace = compounds[s2Compound].basePace + (s2TyreAge * compounds[s2Compound].degPerLap);
        s2TyreAge++;
      }
      s2TotalTime += s2Pace;

      points.push({
        lap: `L${lap}`,
        "1-Stop (M ➔ H)": parseFloat(s1Pace.toFixed(3)),
        "2-Stop (S ➔ M ➔ S)": parseFloat(s2Pace.toFixed(3))
      });
    }

    return { points, s1TotalTime, s2TotalTime };
  };

  const { points: chartData, s1TotalTime, s2TotalTime } = generateSimData();
  const timeDelta = Math.abs(s1TotalTime - s2TotalTime).toFixed(2);
  const optimalStrategy = s1TotalTime < s2TotalTime ? "1-Stop Strategy (Medium ➔ Hard)" : "2-Stop Strategy (Soft ➔ Medium ➔ Soft)";

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity color="var(--cyan-neon)" size={22} />
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
              Tyre Degradation & Pit Strategy Simulator
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Simulate 70-lap stint degradation curves (Soft C4, Medium C3, Hard C2) and calculate optimal race completion times.
          </p>
        </div>

        {/* Optimal Strategy Badge */}
        <div style={{
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid var(--cyan-neon)',
          borderRadius: '12px',
          padding: '8px 16px',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>OPTIMAL STRATEGY</span>
          <div className="font-orbitron" style={{ color: 'var(--cyan-neon)', fontWeight: 800, fontSize: '0.9rem' }}>
            {optimalStrategy}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#FFF' }}>+{timeDelta}s Total Time Advantage</span>
        </div>
      </div>

      {/* Compound Degradation Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {Object.entries(compounds).map(([key, c]) => (
          <div key={key} style={{
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${c.color}40`,
            borderRadius: '10px',
            padding: '12px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="font-orbitron" style={{ color: c.color, fontWeight: 800, fontSize: '0.9rem' }}>{c.name}</span>
              <span className="badge font-mono" style={{ background: c.color, color: '#000', fontSize: '0.65rem', fontWeight: 900 }}>
                {c.degPerLap}s / Lap Deg
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Base Pace: <strong style={{ color: '#FFF' }}>{c.basePace}s</strong> • Max Stint: {key.includes('SOFT') ? '18 Laps' : key.includes('MEDIUM') ? '28 Laps' : '44 Laps'}
            </div>
          </div>
        ))}
      </div>

      {/* Main Recharts Telemetry Stint Chart */}
      <div style={{ width: '100%', height: '320px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px 8px 8px 0', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lap" stroke="var(--text-dim)" tick={{ fontSize: 11 }} />
            <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit="s" />
            <Tooltip contentStyle={{ background: '#0F131C', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#FFF' }} />
            <Legend wrapperStyle={{ color: '#FFF', fontSize: '12px' }} />
            <Line type="monotone" dataKey="1-Stop (M ➔ H)" stroke="#FFB800" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="2-Stop (S ➔ M ➔ S)" stroke="#FF1801" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Strategy Comparison Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{
          background: 'rgba(255, 184, 0, 0.05)',
          border: '1px solid rgba(255, 184, 0, 0.25)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-orbitron" style={{ color: '#FFB800', fontWeight: 800 }}>1-Stop Strategy (Medium ➔ Hard)</span>
            <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>RECOMMENDED</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
            • Stint 1: Medium (Laps 1–25) • Stint 2: Hard (Laps 26–70)<br />
            • Pit Loss: 1 Stop x 21.8s = 21.8s<br />
            • Total Projected Race Time: <strong style={{ color: '#FFF' }}>{(s1TotalTime / 60).toFixed(2)} mins</strong>
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 24, 1, 0.05)',
          border: '1px solid rgba(255, 24, 1, 0.25)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-orbitron" style={{ color: '#FF1801', fontWeight: 800 }}>2-Stop Strategy (Soft ➔ Medium ➔ Soft)</span>
            <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>HIGH DEGRADATION</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
            • Stint 1: Soft (L1-15) • Stint 2: Medium (L16-43) • Stint 3: Soft (L44-70)<br />
            • Pit Loss: 2 Stops x 21.8s = 43.6s<br />
            • Total Projected Race Time: <strong style={{ color: '#FFF' }}>{(s2TotalTime / 60).toFixed(2)} mins</strong>
          </p>
        </div>
      </div>

    </div>
  );
}
