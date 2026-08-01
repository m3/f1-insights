import React, { useState } from 'react';
import { Flag, ArrowUp, ArrowDown, Minus, ShieldAlert, Award, Search } from 'lucide-react';

export default function SessionClassificationTable({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterGainers, setFilterGainers] = useState('ALL');

  const rawStandings = Array.isArray(data?.driverStandings) ? data.driverStandings : [];
  
  const driversList = rawStandings.length > 0 ? rawStandings.map((item, idx) => {
    const dObj = item.Driver || {};
    const cObj = (item.Constructors && item.Constructors[0]) || {};
    const code = dObj.code || `D${idx+1}`;
    const name = `${dObj.givenName || ''} ${dObj.familyName || ''}`.trim() || dObj.driverId || `Driver ${idx+1}`;
    const team = cObj.name || dObj.current_team || 'F1 Team';
    const number = dObj.permanentNumber || `${idx+1}`;
    
    const finishPos = parseInt(item.position || idx + 1, 10);
    const gridPos = item.gridPosition ? parseInt(item.gridPosition, 10) : finishPos;
    const delta = gridPos - finishPos;

    // Remove fake hardcoded tyre strategy. Only show if we actually have them.
    const tyres = Array.isArray(item.tyreStints) && item.tyreStints.length > 0
      ? item.tyreStints
      : [];
    
    const stops = tyres.length > 0 ? tyres.length - 1 : '-';
    
    // Only show status if it exists, otherwise fall back to empty string for standings
    const status = item.status || '';
    
    // Only show time gap if it exists from real telemetry
    let timeGap = '-';
    if (item.Time?.time) timeGap = item.Time.time;
    else if (item.gap) timeGap = item.gap;
    else if (finishPos === 1 && status.includes('Finished')) timeGap = 'Leader';
    
    // For pure standings with no grid position, gridPos should be null so delta is null
    const hasGridPos = item.gridPosition !== undefined && item.gridPosition !== null;
    const gridPosInt = hasGridPos ? parseInt(item.gridPosition, 10) : null;
    const delta = hasGridPos ? (gridPosInt - finishPos) : null;

    return {
      finishPos,
      gridPos: gridPosInt,
      delta,
      code,
      name,
      team,
      number,
      stops,
      tyres,
      status,
      timeGap,
      points: item.points || 0
    };
  }) : [];

  const filteredDrivers = driversList.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = filterTeam === 'ALL' || d.team === filterTeam;
    const matchesGainers = filterGainers === 'ALL' || 
                          (filterGainers === 'GAINERS' && d.delta > 0) || 
                          (filterGainers === 'LOSERS' && d.delta < 0);
    return matchesSearch && matchesTeam && matchesGainers;
  });

  const teams = Array.from(new Set(driversList.map(d => d.team)));

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flag color="var(--f1-red)" size={22} />
            <h2 className="font-orbitron" style={{ fontSize: '1.25rem', color: '#FFF', margin: 0 }}>
              Full 20-Driver Session Classification & Grid Movements
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '4px 0 0 32px' }}>
            Direct empirical session classification (P1 to P20) with starting grid movement deltas and stint strategy.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search driver / team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px 6px 30px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(0,0,0,0.4)',
                color: '#FFF',
                fontSize: '0.8rem',
                outline: 'none',
                width: '160px'
              }}
            />
          </div>

          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(0,0,0,0.4)',
              color: '#FFF',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Teams</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setFilterGainers('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.75rem',
                background: filterGainers === 'ALL' ? 'var(--cyan-neon)' : 'transparent',
                color: filterGainers === 'ALL' ? '#000' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilterGainers('GAINERS')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.75rem',
                background: filterGainers === 'GAINERS' ? '#34D399' : 'transparent',
                color: filterGainers === 'GAINERS' ? '#000' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ▲ Gainers
            </button>
            <button
              onClick={() => setFilterGainers('LOSERS')}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.75rem',
                background: filterGainers === 'LOSERS' ? '#FF453A' : 'transparent',
                color: filterGainers === 'LOSERS' ? '#FFF' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ▼ Losers
            </button>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              <th style={{ padding: '10px 12px' }}>POS</th>
              <th style={{ padding: '10px 12px' }}>GRID</th>
              <th style={{ padding: '10px 12px' }}>DELTA</th>
              <th style={{ padding: '10px 12px' }}>DRIVER & TEAM</th>
              <th style={{ padding: '10px 12px' }}>GAP / TIME</th>
              <th style={{ padding: '10px 12px' }}>STOPS</th>
              <th style={{ padding: '10px 12px' }}>TYRE HISTORY</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((d) => (
              <tr key={d.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#FFF' }}>
                <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 800 }}>
                  {d.finishPos === 1 ? (
                    <span style={{ color: 'var(--gold-warning)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={14} /> P1
                    </span>
                  ) : (
                    `P${d.finishPos}`
                  )}
                </td>

                <td className="font-mono" style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                  {d.gridPos !== null ? `P${d.gridPos}` : '-'}
                </td>

                <td style={{ padding: '10px 12px' }}>
                  {d.delta > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#34D399', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                      <ArrowUp size={12} /> +{d.delta}
                    </span>
                  )}
                  {d.delta < 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#FF453A', background: 'rgba(255, 69, 58, 0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                      <ArrowDown size={12} /> {d.delta}
                    </span>
                  )}
                  {d.delta === 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      <Minus size={12} /> =
                    </span>
                  )}
                  {d.delta === null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      -
                    </span>
                  )}
                </td>

                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 700, color: '#FFF' }}>
                    <span style={{ color: 'var(--cyan-neon)', marginRight: '6px' }}>#{d.number}</span>
                    {d.name} <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({d.code})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.team}</div>
                </td>

                <td className="font-mono" style={{ padding: '10px 12px', color: d.finishPos === 1 ? 'var(--cyan-neon)' : 'var(--text-muted)' }}>
                  {d.timeGap}
                </td>

                <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center' }}>
                  {d.stops}
                </td>

                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {d.tyres.map((c, cIdx) => (
                      <React.Fragment key={cIdx}>
                        {cIdx > 0 && <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>➔</span>}
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: c === 'SOFT' ? '#FF453A' : (c === 'MEDIUM' ? '#FFB000' : '#FFFFFF'),
                          color: c === 'HARD' ? '#000' : '#FFF'
                        }}>
                          {c[0]}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </td>

                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  {d.status.includes('DNF') ? (
                    <span style={{ color: '#FF453A', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldAlert size={12} /> {d.status}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{d.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
