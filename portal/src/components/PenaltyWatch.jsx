import React from 'react';
import { ShieldAlert, AlertCircle, Calendar } from 'lucide-react';

export default function PenaltyWatch({ penaltyPoints }) {
  if (!penaltyPoints || penaltyPoints.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <ShieldAlert color="var(--gold-warning)" size={24} />
        <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
          FIA Driver Penalty Points Tracker (12-Point Ban Rule)
        </h2>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Drivers accumulating 12 penalty points within a rolling 12-month period incur an automatic 1-race ban.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {penaltyPoints.map((drv, idx) => {
          const percent = (drv.points / 12) * 100;
          const isHighRisk = drv.points >= 8;
          const isMedRisk = drv.points >= 4 && drv.points < 8;

          const barColor = isHighRisk ? 'var(--f1-red)' : isMedRisk ? 'var(--gold-warning)' : 'var(--green-success)';

          return (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.03)',
              border: isHighRisk ? '1px solid var(--f1-red)' : '1px solid var(--border-subtle)',
              padding: '16px',
              borderRadius: '12px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>
                  {drv.driver} <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>({drv.code})</span>
                </div>
                <div className="font-mono" style={{ color: barColor, fontWeight: 800, fontSize: '0.95rem' }}>
                  {drv.points} / 12 PTS
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                height: '8px',
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: barColor,
                  borderRadius: '4px',
                  boxShadow: `0 0 8px ${barColor}`
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Next Expiry Date:</span>
                <span className="font-mono" style={{ color: '#FFF' }}>{drv.expiry_next}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
