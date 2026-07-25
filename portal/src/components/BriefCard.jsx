import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck, Flame, Gauge, Timer, Award, Share2 } from 'lucide-react';

export default function BriefCard({ preBrief, postBrief }) {
  const [briefMode, setBriefMode] = useState('PRE_RACE'); // 'PRE_RACE' or 'POST_RACE'
  
  const currentBrief = briefMode === 'PRE_RACE' ? preBrief : postBrief;

  if (!currentBrief) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading latest race morning brief...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Selector Banner */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className={briefMode === 'PRE_RACE' ? 'badge badge-red' : 'badge badge-cyan'}>
              {briefMode === 'PRE_RACE' ? 'PRE-RACE PREVIEW' : 'POST-RACE DEBRIEF'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {currentBrief.date} • {currentBrief.circuitName}
            </span>
          </div>
          <h2 className="font-orbitron" style={{ fontSize: '1.4rem', color: '#FFF' }}>
            {currentBrief.title}
          </h2>
        </div>

        {/* Toggle Mode */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '10px' }}>
          <button
            onClick={() => setBriefMode('PRE_RACE')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              background: briefMode === 'PRE_RACE' ? 'var(--f1-red)' : 'transparent',
              color: briefMode === 'PRE_RACE' ? '#FFF' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            Pre-Race Preview
          </button>
          <button
            onClick={() => setBriefMode('POST_RACE')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              background: briefMode === 'POST_RACE' ? 'var(--cyan-neon)' : 'transparent',
              color: briefMode === 'POST_RACE' ? '#000' : 'var(--text-muted)',
              fontWeight: briefMode === 'POST_RACE' ? 800 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            Post-Race Debrief
          </button>
        </div>
      </div>

      {/* Grid of Key Strategy & Telemetry Facts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {currentBrief.facts && currentBrief.facts.map((fact, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '4px',
              height: '100%',
              background: idx % 2 === 0 ? 'var(--f1-red)' : 'var(--cyan-neon)'
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span className="badge badge-gold">{fact.badge}</span>
              <span className="font-mono font-orbitron" style={{ fontSize: '1rem', color: '#FFF', fontWeight: 800 }}>
                {fact.stat}
              </span>
            </div>

            <h3 style={{ fontSize: '1rem', color: '#FFF', marginBottom: '8px', fontWeight: 700 }}>
              {fact.topic}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {fact.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Special Pre-Race Penalty Warning or Post-Race Battle Summary */}
      {briefMode === 'PRE_RACE' && currentBrief.penaltyWatch && (
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--gold-warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle color="var(--gold-warning)" size={22} />
            <h3 className="font-orbitron" style={{ fontSize: '1.1rem', color: '#FFF' }}>
              Penalty Points & License Risk Watch
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {currentBrief.penaltyWatch.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {currentBrief.penaltyWatch.high_risk_drivers && currentBrief.penaltyWatch.high_risk_drivers.map((drv, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 184, 0, 0.08)',
                border: '1px solid rgba(255, 184, 0, 0.3)',
                padding: '12px 16px',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#FFF', fontWeight: 700 }}>
                  <span>{drv.driver} ({drv.code})</span>
                  <span style={{ color: 'var(--gold-warning)' }}>{drv.points}/12 Pts</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Next points expiry: {drv.expiry_next}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {briefMode === 'POST_RACE' && currentBrief.teammateBattles && (
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--cyan-neon)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Award color="var(--cyan-neon)" size={22} />
            <h3 className="font-orbitron" style={{ fontSize: '1.1rem', color: '#FFF' }}>
              Teammate Head-to-Head Battle Recap
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {currentBrief.teammateBattles.map((team, idx) => (
              <div key={idx} style={{
                background: 'rgba(0, 240, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                padding: '14px 18px',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 800, marginBottom: '6px' }}>
                  {team.team} ({team.drivers})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Qualifying Record:</span>
                  <span className="font-mono" style={{ color: '#FFF' }}>{team.quali}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Race Finish Record:</span>
                  <span className="font-mono" style={{ color: '#FFF' }}>{team.race}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
