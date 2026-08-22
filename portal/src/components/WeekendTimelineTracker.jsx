import React, { useState, useEffect } from 'react';

const SESSION_LABELS = {
  MainQuali: 'Qualifying',
  MainRace: 'Race',
  SprintQuali: 'Sprint Qualifying',
  SprintRace: 'Sprint Race',
};

function sessionLabel(name) {
  return (SESSION_LABELS[name] || name || '').toUpperCase();
}

function formatSessionTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCountdown(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'STARTING NOW';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
}

export default function WeekendTimelineTracker({ timeline, activeView, setActiveView }) {
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeline) return null;

  const states = ['PRE_WEEKEND', 'SESSION_IN_PROGRESS', 'POST_SESSION'];
  const next = timeline.nextSession;

  const getLabel = (st) => {
    switch(st) {
      case 'PRE_WEEKEND': return 'Pre-Weekend';
      case 'SESSION_IN_PROGRESS': return 'Live / In-Progress';
      case 'POST_SESSION': return 'Post-Race Debrief';
      default: return st;
    }
  };

  return (
    <div style={{
      background: 'rgba(20, 20, 25, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 className="font-orbitron" style={{ fontSize: '1.2rem', margin: 0, color: '#FFF' }}>
          {timeline.format === 'sprint' ? 'SPRINT WEEKEND' : 'STANDARD WEEKEND'}
        </h2>
        <div style={{
          padding: '4px 12px',
          borderRadius: '20px',
          background: timeline.dataStatus === 'LIVE' ? 'rgba(255, 24, 1, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          color: timeline.dataStatus === 'LIVE' ? '#FF1801' : '#AAA',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}>
          {timeline.dataStatus}
        </div>
      </div>

      {next && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'rgba(255, 24, 1, 0.12)',
          border: '1px solid rgba(255, 24, 1, 0.35)',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
            NEXT SESSION
          </span>
          <strong style={{ color: '#FF1801', fontSize: '1rem', letterSpacing: '1px' }}>
            {sessionLabel(next.name)}
          </strong>
          <span className="font-mono" style={{ color: '#FFF', fontSize: '0.9rem' }}>
            {formatSessionTime(next.timeUtc)}
          </span>
          <span className="font-mono" style={{ color: '#34D399', fontSize: '0.9rem', fontWeight: 700 }}>
            T-{formatCountdown(next.timeUtc)}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {states.map(st => (
          <button
            key={st}
            onClick={() => setActiveView(st)}
            style={{
              padding: '8px 16px',
              background: activeView === st ? '#FF1801' : 'transparent',
              color: activeView === st ? '#FFF' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              border: activeView === st ? '1px solid #FF1801' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {getLabel(st)}
            {timeline.macroState === st && (
              <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: activeView === st ? '#FFF' : '#FF1801' }}>
                (ACTIVE)
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
