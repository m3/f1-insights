import React from 'react';
import { ShieldAlert, ArrowDownRight, Clock, ShieldCheck } from 'lucide-react';

export default function GridPenaltiesTracker({ penaltiesData }) {
  const startingGridImpacts = Array.isArray(penaltiesData?.startingGridImpacts) ? penaltiesData.startingGridImpacts : [];
  const inRaceTimePenalties = Array.isArray(penaltiesData?.inRaceTimePenalties) ? penaltiesData.inRaceTimePenalties : [];

  const hasNoPenalties = startingGridImpacts.length === 0 && inRaceTimePenalties.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldAlert color="var(--gold-warning)" size={24} />
          <h2 className="font-orbitron" style={{ fontSize: '1.3rem', color: '#FFF' }}>
            Grid & Time Penalties Tracker
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Track how steward decisions, power unit component replacements, and track limit penalties alter starting grids and official race standings.
        </p>
      </div>

      {hasNoPenalties ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <ShieldCheck color="var(--green-success)" size={32} style={{ margin: '0 auto 12px' }} />
          <h3 className="font-orbitron" style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '8px' }}>No Active Penalties</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>The stewards have not issued any grid drops or time penalties for this session.</p>
        </div>
      ) : (
        <>
          {/* Grid 1: Starting Grid Penalties */}
          {startingGridImpacts.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <ArrowDownRight color="var(--f1-red)" size={20} />
                <h3 className="font-orbitron" style={{ fontSize: '1.05rem', color: '#FFF' }}>
                  Starting Grid Drops
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {startingGridImpacts.map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 24, 1, 0.05)',
                    border: '1px solid rgba(255, 24, 1, 0.25)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <span className="font-orbitron" style={{ color: '#FFF', fontWeight: 800, fontSize: '1rem' }}>
                          {item.driver} ({item.code})
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.team}</div>
                      </div>
                      <span className="badge badge-red font-mono" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                        +{item.drop} PLACES DROP
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      ⚠️ <strong>Reason</strong>: {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid 2: Time Penalties */}
          {inRaceTimePenalties.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <Clock color="var(--cyan-neon)" size={20} />
                <h3 className="font-orbitron" style={{ fontSize: '1.05rem', color: '#FFF' }}>
                  Time Penalties
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {inRaceTimePenalties.map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(0, 240, 255, 0.04)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="font-orbitron" style={{ color: '#FFF', fontWeight: 800, fontSize: '0.95rem' }}>
                        {item.driver} ({item.code})
                      </span>
                      <span className="badge badge-cyan font-mono" style={{ fontSize: '0.85rem', fontWeight: 900 }}>
                        {item.penaltyTime} PENALTY
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.4' }}>
                      🚨 <strong>Infraction</strong>: {item.infraction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
