import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowDownRight, Clock, Award, CheckCircle } from 'lucide-react';

export default function GridPenaltiesTracker({ penaltiesData }) {
  // Sample/Fallback grid & time penalties data if pending pipeline fetch
  const startingGridImpacts = Array.isArray(penaltiesData?.startingGridImpacts) ? penaltiesData.startingGridImpacts : [
    {
      driver: "Max Verstappen",
      code: "VER",
      team: "Red Bull",
      qualiPos: 2,
      gridPos: 7,
      drop: 5,
      reason: "5th Internal Combustion Engine (ICE) change",
      status: "GRID PENALTY APPLIED"
    },
    {
      driver: "Lance Stroll",
      code: "STR",
      team: "Aston Martin",
      qualiPos: 12,
      gridPos: 15,
      drop: 3,
      reason: "Impeding NOR during Q2 Turn 4 braking zone",
      status: "GRID PENALTY APPLIED"
    },
    {
      driver: "Kevin Magnussen",
      code: "MAG",
      team: "Haas",
      qualiPos: 18,
      gridPos: 20,
      drop: 2,
      reason: "New Energy Store (ES) & Control Electronics (CE)",
      status: "PIT LANE START RISK"
    }
  ];

  const inRaceTimePenalties = Array.isArray(penaltiesData?.inRaceTimePenalties) ? penaltiesData.inRaceTimePenalties : [
    {
      driver: "Lando Norris",
      code: "NOR",
      team: "McLaren",
      penaltyTime: "+5.0s",
      infraction: "Track Limits Exceeded (4th Strike at Turn 4 & Turn 11)",
      raceImpact: "Dropped P2 -> P3 post-race calculation",
      lap: "Lap 48",
      stewardsDoc: "Doc 42 - Decision"
    },
    {
      driver: "Oliver Bearman",
      code: "BEA",
      team: "Haas",
      penaltyTime: "+10.0s",
      infraction: "Forcing another driver off track into Turn 1 entry",
      raceImpact: "Dropped P11 -> P14",
      lap: "Lap 14",
      stewardsDoc: "Doc 28 - Decision"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldAlert color="var(--gold-warning)" size={24} />
          <h2 className="font-orbitron" style={{ fontSize: '1.3rem', color: '#FFF' }}>
            Grid & Time Penalties Impact Tracker
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Track how steward decisions, power unit component replacements, and track limit penalties alter qualifying starting orders and official race standings.
        </p>
      </div>

      {/* Grid 1: Starting Grid Penalties (Quali -> Race Grid Drops) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <ArrowDownRight color="var(--f1-red)" size={20} />
          <h3 className="font-orbitron" style={{ fontSize: '1.05rem', color: '#FFF' }}>
            Starting Grid Drops & Power Unit Penalty Grid Shift
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

              {/* Quali vs Start Grid Visual Shift */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                margin: '12px 0',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>QUALIFIED</span>
                  <div className="font-mono font-orbitron" style={{ color: '#FFF', fontWeight: 800, fontSize: '1.1rem' }}>
                    P{item.qualiPos}
                  </div>
                </div>
                <div style={{ color: 'var(--f1-red)', fontWeight: 800, fontSize: '1.2rem' }}>➔</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>STARTS RACE</span>
                  <div className="font-mono font-orbitron" style={{ color: 'var(--gold-warning)', fontWeight: 900, fontSize: '1.1rem' }}>
                    P{item.gridPos}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                ⚠️ <strong>Reason</strong>: {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid 2: In-Race & Post-Race Time Penalties */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <Clock color="var(--cyan-neon)" size={20} />
          <h3 className="font-orbitron" style={{ fontSize: '1.05rem', color: '#FFF' }}>
            In-Race & Post-Race Time Penalties (+5s / +10s Time Additions)
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

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: 'var(--gold-warning)',
                fontWeight: 700,
                display: 'flex',
                justify: 'space-between'
              }}>
                <span>{item.raceImpact}</span>
                <span style={{ color: 'var(--text-dim)' }}>{item.lap} • {item.stewardsDoc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
