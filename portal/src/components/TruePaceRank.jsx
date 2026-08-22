import React from 'react';
import { Timer, TrendingUp, Hourglass } from 'lucide-react';

export default function TruePaceRank({ data }) {
  const paceData = Array.isArray(data?.paceMetrics) ? data.paceMetrics : [];

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

      {paceData.length === 0 ? (
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Hourglass size={16} style={{ verticalAlign: '-3px', marginRight: '6px' }} />
          True pace analysis awaiting telemetry — no values shown until real data is available.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 50px 1fr 1fr', padding: '0 16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Rank</span>
            <span>Code</span>
            <span>Official Pace</span>
            <span style={{ textAlign: 'right' }}>True Pace</span>
          </div>
          {paceData.map((driver) => {
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
      )}
    </div>
  );
}
