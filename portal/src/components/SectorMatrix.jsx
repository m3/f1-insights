import React, { useState } from 'react';
import { Gauge, Zap, Search, ShieldCheck, TrendingUp } from 'lucide-react';

export default function SectorMatrix() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lapTime');

  // Realistic F1 Sector Times & Speed Traps Dataset
  const sectorData = [
    { code: 'NOR', name: 'Lando Norris', team: 'McLaren', s1: '28.142', s2: '36.410', s3: '22.890', st: 338.4, lapTime: '1:27.442', s1Best: true, s2Best: false, s3Best: true, stBest: false },
    { code: 'VER', name: 'Max Verstappen', team: 'Red Bull', s1: '28.210', s2: '36.388', s3: '22.920', st: 341.8, lapTime: '1:27.518', s1Best: false, s2Best: true, s3Best: false, stBest: true },
    { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', s1: '28.188', s2: '36.450', s3: '22.915', st: 337.9, lapTime: '1:27.553', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', s1: '28.245', s2: '36.490', s3: '22.940', st: 339.2, lapTime: '1:27.675', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', s1: '28.290', s2: '36.520', s3: '22.980', st: 338.8, lapTime: '1:27.790', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'RUS', name: 'George Russell', team: 'Mercedes', s1: '28.310', s2: '36.540', s3: '23.010', st: 339.5, lapTime: '1:27.860', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'SAI', name: 'Carlos Sainz', team: 'Williams', s1: '28.340', s2: '36.580', s3: '23.050', st: 342.1, lapTime: '1:27.970', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'ALB', name: 'Alex Albon', team: 'Williams', s1: '28.380', s2: '36.620', s3: '23.090', st: 340.6, lapTime: '1:28.090', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'LAW', name: 'Liam Lawson', team: 'Red Bull', s1: '28.410', s2: '36.690', s3: '23.140', st: 338.1, lapTime: '1:28.240', s1Best: false, s2Best: false, s3Best: false, stBest: false },
    { code: 'ANT', name: 'Kimi Antonelli', team: 'Mercedes', s1: '28.450', s2: '36.720', s3: '23.180', st: 337.5, lapTime: '1:28.350', s1Best: false, s2Best: false, s3Best: false, stBest: false }
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
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: d.s1Best ? 'rgba(192, 132, 252, 0.15)' : 'rgba(74, 222, 128, 0.1)'
                  }}>
                    {d.s1}s
                  </span>
                </td>

                {/* Sector 2 */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: d.s2Best ? '#C084FC' : '#4ADE80',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: d.s2Best ? 'rgba(192, 132, 252, 0.15)' : 'rgba(74, 222, 128, 0.1)'
                  }}>
                    {d.s2}s
                  </span>
                </td>

                {/* Sector 3 */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: d.s3Best ? '#C084FC' : '#4ADE80',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: d.s3Best ? 'rgba(192, 132, 252, 0.15)' : 'rgba(74, 222, 128, 0.1)'
                  }}>
                    {d.s3}s
                  </span>
                </td>

                {/* Speed Trap */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    color: d.stBest ? '#C084FC' : '#FFF',
                    fontWeight: d.stBest ? 800 : 500,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: d.stBest ? 'rgba(192, 132, 252, 0.15)' : 'transparent'
                  }}>
                    {d.st} km/h
                  </span>
                </td>

                {/* Best Lap */}
                <td className="font-orbitron" style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: index === 0 ? '#FF1801' : '#FFF' }}>
                  {d.lapTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
