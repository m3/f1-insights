import React from 'react';
import { Timer, TrendingUp, AlertTriangle } from 'lucide-react';

// Mock data for True Pace
const DEFAULT_PACE_DATA = [
  { code: 'NOR', officialRank: 1, trueRank: 1, rawPace: '1:14.205', fuelCorr: -0.2, trafficCorr: 0, finalPace: '1:14.005' },
  { code: 'VER', officialRank: 4, trueRank: 2, rawPace: '1:14.850', fuelCorr: -0.5, trafficCorr: -0.3, finalPace: '1:14.050' },
  { code: 'PIA', officialRank: 2, trueRank: 3, rawPace: '1:14.410', fuelCorr: -0.1, trafficCorr: 0, finalPace: '1:14.310' },
  { code: 'HAM', officialRank: 3, trueRank: 4, rawPace: '1:14.620', fuelCorr: -0.2, trafficCorr: 0, finalPace: '1:14.420' }
];

export default function TruePaceRank({ data }) {
  const paceData = data?.paceMetrics || DEFAULT_PACE_DATA;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
        <h3 className="font-orbitron" style={{ margin: 0, fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={20} color="var(--cyan-neon)" />
          TRUE PACE RANK
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
          Corrected for Fuel & Traffic
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 50px 1fr 1fr', padding: '0 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Rank</span>
          <span>Code</span>
          <span>Official Pace</span>
          <span style={{ textAlign: 'right' }}>True Pace</span>
        </div>
        {paceData.map((driver, idx) => {
          const isHiddenPace = driver.trueRank < driver.officialRank;
          return (
            <div key={driver.code} style={{ 
              display: 'grid', 
              gridTemplateColumns: '40px 50px 1fr 1fr', 
              alignItems: 'center',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '6px',
              padding: '12px 16px',
              borderLeft: isHiddenPace ? '2px solid var(--cyan-neon)' : '2px solid transparent'
            }}>
              <span className="font-orbitron" style={{ fontWeight: 'bold' }}>{driver.trueRank}</span>
              <span className="font-orbitron">{driver.code}</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: 'var(--text-muted)', textDecoration: isHiddenPace ? 'line-through' : 'none' }}>{driver.rawPace}</span>
                {isHiddenPace && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--cyan-neon)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <TrendingUp size={10} /> Hidden Pace Detected
                  </span>
                )}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <span className="font-orbitron" style={{ color: isHiddenPace ? 'var(--cyan-neon)' : '#FFF' }}>{driver.finalPace}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
