import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck, Flame, Gauge, Timer, Award, Copy, Check } from 'lucide-react';

export default function BriefCard({ preBrief, postBrief }) {
  const [briefMode, setBriefMode] = useState('PRE_RACE'); // 'PRE_RACE' or 'POST_RACE'
  const [copied, setCopied] = useState(false);
  
  const currentBrief = briefMode === 'PRE_RACE' ? preBrief : postBrief;

  const handleCopyMarkdown = () => {
    if (currentBrief && currentBrief.markdown) {
      navigator.clipboard.writeText(currentBrief.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

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

        {/* Action Controls: Toggle Mode + Copy Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
              PRE-RACE PREVIEW
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
              POST-RACE DEBRIEF
            </button>
          </div>

          {/* 1-Click Copy Briefing Button for Discord/Telegram */}
          <button
            onClick={handleCopyMarkdown}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              padding: '8px 14px',
              background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: copied ? '1px solid #22C55E' : '1px solid var(--border-subtle)',
              color: copied ? '#22C55E' : '#FFF',
              transition: 'all 0.2s ease'
            }}
            title="Copy formatted Markdown brief to clipboard for Discord or Telegram"
          >
            {copied ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Brief (Markdown)'}</span>
          </button>
        </div>
      </div>

      {Array.isArray(currentBrief?.facts) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {currentBrief.facts.map((fact, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '18px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{fact.badge}</span>
                <span className="font-mono font-orbitron" style={{ fontSize: '1rem', color: 'var(--cyan-neon)', fontWeight: 800 }}>
                  {fact.stat}
                </span>
              </div>
              <h3 style={{ fontSize: '0.95rem', color: '#FFF', fontWeight: 700, marginBottom: '6px' }}>
                {fact.topic}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {fact.detail}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Driver Penalty Point Watch Banner */}
      {briefMode === 'PRE_RACE' && currentBrief.penaltyWatch && currentBrief.penaltyWatch.high_risk_drivers && (
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--gold-warning)', background: 'rgba(234, 179, 8, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <AlertTriangle color="var(--gold-warning)" size={20} />
            <h3 className="font-orbitron" style={{ fontSize: '1rem', color: '#FFF' }}>
              FIA Super Licence Penalty Watch ({currentBrief.penaltyWatch.total_drivers_flagged} Flagged)
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {(currentBrief.penaltyWatch.high_risk_drivers || []).map((driver, idx) => (
              <div key={idx} style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span className="font-orbitron" style={{ fontWeight: 800, color: '#FFF' }}>{driver.driver} ({driver.code})</span>
                <span className="font-mono" style={{ color: 'var(--gold-warning)', fontWeight: 700 }}>{driver.points}/12 Pts</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Expiry: {driver.expiry_next}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Markdown Body */}
      {currentBrief.markdown && (
        <div className="glass-panel" style={{ padding: '28px', lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <div style={{ color: '#FFF' }}>
            {currentBrief.markdown.split('\n\n').map((paragraph, pIdx) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={pIdx} className="font-orbitron text-gradient-red" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{paragraph.replace('# ', '')}</h1>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={pIdx} className="font-orbitron" style={{ fontSize: '1.1rem', color: '#FFF', marginTop: '20px', marginBottom: '10px' }}>{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={pIdx} style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                    {paragraph.split('\n').map((li, lIdx) => (
                      <li key={lIdx} style={{ marginBottom: '6px' }}>{li.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={pIdx} style={{ marginBottom: '14px' }}>{paragraph}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
