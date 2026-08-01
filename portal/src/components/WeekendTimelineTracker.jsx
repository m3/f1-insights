import React from 'react';

export default function WeekendTimelineTracker({ timeline, activeView, setActiveView }) {
  if (!timeline) return null;

  const states = ['PRE_WEEKEND', 'SESSION_IN_PROGRESS', 'POST_SESSION'];
  
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
      marginBottom: '24px'
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
      
      <div style={{ display: 'flex', gap: '8px' }}>
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
