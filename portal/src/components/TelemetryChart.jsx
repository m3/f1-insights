import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Activity, Users } from 'lucide-react';

export default function TelemetryChart({ telemetryData }) {
  const [metric, setMetric] = useState('speed'); // 'speed' or 'throttle'
  const [driver1, setDriver1] = useState('NOR');
  const [driver2, setDriver2] = useState('VER');

  const driversMap = telemetryData?.drivers || {
    "NOR": { "name": "Lando Norris", "team": "McLaren", "color": "#00F0FF" },
    "VER": { "name": "Max Verstappen", "team": "Red Bull", "color": "#FF1801" },
    "PIA": { "name": "Oscar Piastri", "team": "McLaren", "color": "#FFB800" },
    "LEC": { "name": "Charles Leclerc", "team": "Ferrari", "color": "#E50000" },
    "HAM": { "name": "Lewis Hamilton", "team": "Ferrari", "color": "#00E676" },
    "RUS": { "name": "George Russell", "team": "Mercedes", "color": "#00D2BE" }
  };

  const chartData = telemetryData?.traceData || [
    { distance: 0, NOR_speed: 310, VER_speed: 312, NOR_throttle: 100, VER_throttle: 100 },
    { distance: 400, NOR_speed: 135, VER_speed: 130, NOR_throttle: 10, VER_throttle: 0 },
    { distance: 1000, NOR_speed: 215, VER_speed: 210, NOR_throttle: 75, VER_throttle: 70 },
    { distance: 1600, NOR_speed: 175, VER_speed: 170, NOR_throttle: 70, VER_throttle: 65 },
    { distance: 2400, NOR_speed: 128, VER_speed: 125, NOR_throttle: 15, VER_throttle: 12 },
    { distance: 3000, NOR_speed: 318, VER_speed: 321, NOR_throttle: 100, VER_throttle: 100 }
  ];

  const d1Obj = driversMap[driver1] || {};
  const d2Obj = driversMap[driver2] || {};

  const d1Key = `${driver1}_${metric}`;
  const d2Key = `${driver2}_${metric}`;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Top Header & Selector Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity color="var(--cyan-neon)" size={22} />
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
              Interactive Lap Telemetry Delta
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Comparing <span style={{ color: d1Obj.color, fontWeight: 700 }}>{d1Obj.name}</span> vs <span style={{ color: d2Obj.color, fontWeight: 700 }}>{d2Obj.name}</span> across lap distance (m).
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Driver Selectors */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '8px' }}>
            <Users size={14} color="var(--text-dim)" />
            <select
              value={driver1}
              onChange={(e) => setDriver1(e.target.value)}
              style={{
                background: '#0F172A',
                color: d1Obj.color,
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {Object.keys(driversMap).map((code) => (
                <option key={code} value={code}>
                  {driversMap[code].name} ({code})
                </option>
              ))}
            </select>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>vs</span>
            <select
              value={driver2}
              onChange={(e) => setDriver2(e.target.value)}
              style={{
                background: '#0F172A',
                color: d2Obj.color,
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {Object.keys(driversMap).map((code) => (
                <option key={code} value={code}>
                  {driversMap[code].name} ({code})
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setMetric('speed')}
              className="touch-target-btn"
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                background: metric === 'speed' ? 'var(--cyan-neon)' : 'transparent',
                color: metric === 'speed' ? '#000' : 'var(--text-muted)',
                fontWeight: 800
              }}
            >
              Speed (km/h)
            </button>
            <button
              onClick={() => setMetric('throttle')}
              className="touch-target-btn"
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                background: metric === 'throttle' ? 'var(--f1-red)' : 'transparent',
                color: metric === 'throttle' ? '#FFF' : 'var(--text-muted)',
                fontWeight: 800
              }}
            >
              Throttle (%)
            </button>
          </div>

        </div>
      </div>

      {/* Telemetry Chart */}
      <div style={{ width: '100%', height: '360px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="distance" stroke="var(--text-dim)" unit="m" tick={{ fontSize: 12 }} />
            <YAxis stroke="var(--text-dim)" domain={[0, 'auto']} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#0F172A', border: '1px solid var(--cyan-neon)', borderRadius: '10px' }}
              labelStyle={{ color: '#FFF', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey={d1Key}
              name={`${d1Obj.name} (${metric === 'speed' ? 'km/h' : '%'})`}
              stroke={d1Obj.color || 'var(--cyan-neon)'}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey={d2Key}
              name={`${d2Obj.name} (${metric === 'speed' ? 'km/h' : '%'})`}
              stroke={d2Obj.color || 'var(--f1-red)'}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Sector Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Turn 1 Minimum Apex Speed</div>
          <div style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 700, marginTop: '2px' }}>
            {d1Obj.name} carries apex speed advantage at 400m.
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Main Straight Top Speed</div>
          <div style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 700, marginTop: '2px' }}>
            {d2Obj.name} top speed: DRS open at 3000m.
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Throttle Pickup Point</div>
          <div style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 700, marginTop: '2px' }}>
            Earlier corner exit acceleration out of hairpin.
          </div>
        </div>
      </div>
    </div>
  );
}
