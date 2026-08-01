import React from 'react';
import { Microscope, GitMerge, RotateCcw, Share2 } from 'lucide-react';

// Mock data for Forensic Telemetry
const DEFAULT_TELEMETRY = [
  { id: 'T1', driver: 'NOR', event: 'Turn 4 Braking Early', timeLoss: '0.15s', reason: 'Conserving rear-left tyre', counterFactual: 'Would have passed VER if braked at T-50m' },
  { id: 'T2', driver: 'HAM', event: 'Suboptimal Exit T11', timeLoss: '0.22s', reason: 'Dirty air from VER', counterFactual: 'Expected 1:14.2 without wake' },
  { id: 'T3', driver: 'LEC', event: 'Early Lift-off', timeLoss: '0.10s', reason: 'Fuel saving required', counterFactual: 'Target pace achievable without saving' }
];

export default function ForensicTelemetry({ data }) {
  const telemetryData = data?.forensicTelemetry || DEFAULT_TELEMETRY;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
        <h3 className="font-orbitron" style={{ margin: 0, fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Microscope size={20} color="#C084FC" />
          FORENSIC TELEMETRY
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
            AI Micro-Sector Analysis
          </span>
          <button style={{ background: 'rgba(192, 132, 252, 0.2)', border: '1px solid #C084FC', color: '#FFF', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem' }} onClick={() => alert('Insight copied to clipboard for X/Reddit!')}>
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {telemetryData.map(item => (
          <div key={item.id} style={{ 
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '6px',
            padding: '16px',
            borderLeft: '2px solid #C084FC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-orbitron" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.driver}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.event}</span>
              </div>
              <span style={{ color: '#EF4444', fontWeight: 'bold' }}>+{item.timeLoss}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-muted)' }}>
                <GitMerge size={14} style={{ marginTop: '2px', minWidth: '14px' }} />
                <span><strong>Root Cause:</strong> {item.reason}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--cyan-neon)' }}>
                <RotateCcw size={14} style={{ marginTop: '2px', minWidth: '14px' }} />
                <span><strong>Counterfactual:</strong> {item.counterFactual}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
