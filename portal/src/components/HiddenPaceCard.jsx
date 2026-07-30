import React from 'react';
import { Eye, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function HiddenPaceCard({
  hiddenPaceDrivers = [
    { driver: "NOR", trackPosition: 5, clearAirRank: 2, hiddenDelta: 3, clearAirMeanPace: 82.410, clearAirLapsCount: 14 }
  ],
  summary = "Detected 1 driver(s) trapped in traffic with top-rank clear air pace."
}) {
  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid var(--cyan-neon)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <Eye color="var(--cyan-neon)" size={22} />
        <div>
          <h3 className="font-orbitron" style={{ fontSize: '1.1rem', color: '#FFF', margin: 0 }}>
            Hidden Pace & DRS Traffic Detector
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Isolates green-flag clear-air laps (gap ≥ 1.0s, non-SC, non-pit) to find drivers trapped behind slower cars.
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
        {summary}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              <th style={{ padding: '8px 10px' }}>DRIVER</th>
              <th style={{ padding: '8px 10px' }}>TRACK POS</th>
              <th style={{ padding: '8px 10px' }}>CLEAR AIR RANK</th>
              <th style={{ padding: '8px 10px' }}>HIDDEN DELTA</th>
              <th style={{ padding: '8px 10px' }}>CLEAR AIR PACE</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>LAPS ANALYZED</th>
            </tr>
          </thead>
          <tbody>
            {hiddenPaceDrivers.map((d) => (
              <tr key={d.driver} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#FFF' }}>
                <td style={{ padding: '8px 10px', fontWeight: 800, color: 'var(--cyan-neon)' }}>
                  {d.driver}
                </td>
                <td className="font-mono" style={{ padding: '8px 10px', color: '#FF453A' }}>
                  P{d.trackPosition}
                </td>
                <td className="font-mono" style={{ padding: '8px 10px', color: '#34D399', fontWeight: 700 }}>
                  P{d.clearAirRank}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--gold-warning)', background: 'rgba(255, 176, 0, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                    <ArrowUpRight size={12} /> +{d.hiddenDelta} Pos Capability
                  </span>
                </td>
                <td className="font-mono" style={{ padding: '8px 10px', color: '#FFF' }}>
                  {d.clearAirMeanPace}s
                </td>
                <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-dim)' }}>
                  {d.clearAirLapsCount} laps
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
