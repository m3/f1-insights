import React from 'react';
import { Award, Swords, TrendingUp } from 'lucide-react';

export default function TeammateBattles({ battles }) {
  if (!battles || battles.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Swords color="var(--cyan-neon)" size={24} />
        <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
          Teammate Head-to-Head Intra-Team Battles
        </h2>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Qualifying head-to-head records and race finish comparisons across the grid.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {battles.map((b, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid var(--cyan-neon)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-cyan">{b.team}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold-warning)', fontWeight: 700 }}>
                Leader: {b.leader}
              </span>
            </div>

            <h3 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '12px', fontWeight: 800 }}>
              {b.drivers}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Qualifying Score</span>
                <span className="font-mono" style={{ color: '#FFF', fontWeight: 700 }}>{b.quali}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Race Finish Score</span>
                <span className="font-mono" style={{ color: '#FFF', fontWeight: 700 }}>{b.race}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
