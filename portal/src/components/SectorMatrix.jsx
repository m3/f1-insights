import React, { useState } from 'react';
import { Gauge, Zap, Search, ShieldCheck, TrendingUp } from 'lucide-react';

export default function SectorMatrix({ sectorData: initialData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lapTime');

  const sectorData = initialData || [
    { code: 'NOR', name: 'Lando Norris', team: 'McLaren', s1: '28.142', s2: '36.410', s3: '22.890', st: 338.4, lapTime: '1:27.442', s1Best: true, s2Best: false, s3Best: true, stBest: false },
    { code: 'VER', name: 'Max Verstappen', team: 'Red Bull', s1: '28.210', s2: '36.388', s3: '22.920', st: 341.8, lapTime: '1:27.518', s1Best: false, s2Best: true, s3Best: false, stBest: true },
    { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', s1: '28.188', s2: '36.450', s3: '22.915', st: 337.9, lapTime: '1:27.553', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', s1: '28.245', s2: '36.490', s3: '22.940', st: 339.2, lapTime: '1:27.675', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', s1: '28.290', s2: '36.520', s3: '22.980', st: 338.8, lapTime: '1:27.790', s1Best: false, s2Best: false, s3Best: false, stBest: false }
  ];

  const filteredData = sectorData.filter(
    d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.team.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
      
      {/* Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF1801', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Gauge size={16} /> Live Sector Times & Speed Trap Matrix
          </div>
          <h2 className="font-orbitron text-gradient-red" style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 0' }}>
            Sector Performance Matrix
          </h2>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search driver, team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#FFF',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Legend Badges */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.78rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#C084FC' }} /> Overall Session Best (Purple)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ADE80' }} /> Personal Best (Green)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EAB308' }} /> Normal Stint (Yellow)
        </span>
      </div>

      {/* Table Matrix */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <th style={{ padding: '10px 12px' }}>Driver</th>
              <th style={{ padding: '10px 12px' }}>Team</th>
              <th style={{ padding: '10px 12px' }}>Sector 1</th>
              <th style={{ padding: '10px 12px' }}>Sector 2</th>
              <th style={{ padding: '10px 12px' }}>Sector 3</th>
              <th style={{ padding: '10px 12px' }}>Speed Trap</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Best Lap</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d, index) => (
              <tr key={d.code} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent' }}>
                <td style={{ padding: '12px', fontWeight: 700, color: '#FFF' }}>
                  <span className="font-orbitron" style={{ color: '#FF1801', marginRight: '8px' }}>{d.code}</span>
                  {d.name}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{d.team}</td>
                
                {/* Sector 1 */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: d.s1Best ? '#C084FC' : '#4ADE80',
                    fontWeight: d.s1Best ? 800 : 500
                  }}>
                    {d.s1}s
                  </span>
                </td>

                {/* Sector 2 */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: d.s2Best ? '#C084FC' : '#4ADE80',
                    fontWeight: d.s2Best ? 800 : 500
                  }}>
                    {d.s2}s
                  </span>
                </td>

                {/* Sector 3 */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: d.s3Best ? '#C084FC' : '#4ADE80',
                    fontWeight: d.s3Best ? 800 : 500
                  }}>
                    {d.s3}s
                  </span>
                </td>

                {/* Speed Trap */}
                <td style={{ padding: '12px' }}>
                  <span className="font-orbitron" style={{ color: d.stBest ? 'var(--cyan-neon)' : '#FFF', fontWeight: d.stBest ? 800 : 400 }}>
                    {d.st} km/h
                  </span>
                </td>

                {/* Best Lap */}
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#FFF' }}>
                  <span className="font-mono">{d.lapTime}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
