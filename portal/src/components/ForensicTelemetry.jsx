import React from 'react';
import { Microscope, GitMerge, RotateCcw, Hourglass } from 'lucide-react';

export default function ForensicTelemetry({ data }) {
  const telemetryData = Array.isArray(data?.forensicTelemetry) ? data.forensicTelemetry : [];

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
        <h3 className="font-orbitron" style={{ margin: 0, fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Microscope size={20} color="#C084FC" />
          FORENSIC TELEMETRY
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
          AI Micro-Sector Analysis
        </span>
      </div>

      {telemetryData.length === 0 ? (
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Hourglass size={16} style={{ verticalAlign: '-3px', marginRight: '6px' }} />
          Micro-sector analysis awaiting telemetry — no findings shown until real data is available.
        </div>
      ) : (
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
      )}
    </div>
  );
}
