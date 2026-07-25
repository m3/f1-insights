import React, { useState } from 'react';
import { Trophy, Calendar, MapPin } from 'lucide-react';

export default function StandingsView({ driverStandings, constructorStandings, schedule }) {
  const [mode, setMode] = useState('wdc'); // 'wdc', 'wcc', 'schedule'

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy color="var(--gold-warning)" size={22} />
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
              Championship Standings & 2026 Calendar
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setMode('wdc')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              background: mode === 'wdc' ? 'var(--f1-red)' : 'transparent',
              color: mode === 'wdc' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 800
            }}
          >
            Drivers (WDC)
          </button>
          <button
            onClick={() => setMode('wcc')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              background: mode === 'wcc' ? 'var(--cyan-neon)' : 'transparent',
              color: mode === 'wcc' ? '#000' : 'var(--text-muted)',
              fontWeight: 800
            }}
          >
            Constructors (WCC)
          </button>
          <button
            onClick={() => setMode('schedule')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              background: mode === 'schedule' ? 'var(--gold-warning)' : 'transparent',
              color: mode === 'schedule' ? '#000' : 'var(--text-muted)',
              fontWeight: 800
            }}
          >
            Race Calendar
          </button>
        </div>
      </div>

      {mode === 'wdc' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '12px' }}>POS</th>
                <th style={{ padding: '12px' }}>DRIVER</th>
                <th style={{ padding: '12px' }}>TEAM</th>
                <th style={{ padding: '12px' }}>WINS</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>POINTS</th>
              </tr>
            </thead>
            <tbody>
              {driverStandings.map((d, idx) => {
                const driverObj = d.Driver || {};
                const teamName = (d.Constructors && d.Constructors[0] && d.Constructors[0].name) || '';
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#FFF' }}>
                    <td className="font-mono" style={{ padding: '12px', fontWeight: 800 }}>{d.position}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      {driverObj.givenName} {driverObj.familyName} <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>({driverObj.code})</span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{teamName}</td>
                    <td className="font-mono" style={{ padding: '12px' }}>{d.wins}</td>
                    <td className="font-mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: 'var(--cyan-neon)' }}>{d.points} PTS</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'wcc' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '12px' }}>POS</th>
                <th style={{ padding: '12px' }}>CONSTRUCTOR</th>
                <th style={{ padding: '12px' }}>WINS</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>POINTS</th>
              </tr>
            </thead>
            <tbody>
              {constructorStandings.map((c, idx) => {
                const cObj = c.Constructor || {};
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#FFF' }}>
                    <td className="font-mono" style={{ padding: '12px', fontWeight: 800 }}>{c.position}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{cObj.name}</td>
                    <td className="font-mono" style={{ padding: '12px' }}>{c.wins}</td>
                    <td className="font-mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: 'var(--f1-red)' }}>{c.points} PTS</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {schedule.map((r, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                <span>ROUND {r.round}</span>
                <span className="font-mono">{r.date}</span>
              </div>
              <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>{r.raceName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {r.Circuit?.circuitName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
