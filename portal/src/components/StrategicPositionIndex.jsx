import React from 'react';
import { Target, Activity, ShieldAlert, Zap, Hourglass } from 'lucide-react';

export default function StrategicPositionIndex({ data }) {
  const spiData = Array.isArray(data?.spiMetrics) ? data.spiMetrics : [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Optimal': return '#10B981'; // Green
      case 'Vulnerable': return '#F59E0B'; // Yellow
      case 'Traffic Risk': return '#F97316'; // Orange
      case 'Degrading': return '#EF4444'; // Red
      default: return '#EF4444';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
        <h3 className="font-orbitron" style={{ margin: 0, fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} color="#FF1801" />
          STRATEGIC POSITION INDEX
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
          Real-time / Prediction
        </span>
      </div>

      {spiData.length === 0 ? (
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Hourglass size={16} style={{ verticalAlign: '-3px', marginRight: '6px' }} />
          SPI metrics awaiting telemetry — no values shown until real data is available.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {spiData.map((driver) => (
            <div key={driver.code} style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 60px',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '6px',
              padding: '12px 16px',
              borderLeft: `4px solid ${getStatusColor(driver.status)}`
            }}>
              <span className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{driver.code}</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '16px' }}>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${driver.spi}%`,
                    height: '100%',
                    background: getStatusColor(driver.status),
                    boxShadow: `0 0 10px ${getStatusColor(driver.status)}`
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12} /> Tyre: {driver.tyreCompound} ({driver.tyreLifeDelta > 0 ? '+' : ''}{driver.tyreLifeDelta})</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} /> Clean Air: {driver.cleanAirGap}s</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12} /> Pit Cushion: {driver.pitCushion}s</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="font-orbitron" style={{ fontSize: '1.4rem', color: '#FFF' }}>{typeof driver.spi === 'number' ? driver.spi.toFixed(1) : driver.spi}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
