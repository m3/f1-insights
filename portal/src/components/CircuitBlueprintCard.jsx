import React, { useState } from 'react';
import { Navigation, Zap, MapPin } from 'lucide-react';
import { getCircuitSvgMap } from '../data/circuitPaths';

export default function CircuitBlueprintCard({ currentRace, circuitSpecsData }) {
  const [selectedZone, setSelectedZone] = useState('drs1');

  const circuitId = currentRace?.Circuit?.circuitId || 'hungaroring';
  const circuitName = currentRace?.Circuit?.circuitName || 'Hungaroring';
  const locality = currentRace?.Circuit?.Location?.locality || 'Budapest';
  const country = currentRace?.Circuit?.Location?.country || 'Hungary';

  const circuitVectorMap = getCircuitSvgMap(circuitId);

  const circuitSpecs = circuitSpecsData || {
    length: "4.381 km",
    laps: "70 Laps",
    raceDistance: "306.63 km",
    lapRecord: "1:16.627 (Lewis Hamilton, 2020)",
    drsZones: [
      {
        id: "drs1",
        name: "DRS Zone 1 (Main Straight)",
        detection: "Turn 14 Exit (70m before turn apex)",
        activation: "Main Pit Straight (Turn 14 to Turn 1)",
        length: "680 meters",
        topSpeed: "342.4 km/h",
        overtakeProb: "High (Primary Passing Zone)"
      },
      {
        id: "drs2",
        name: "DRS Zone 2 (Turn 1 - Turn 2 Short Straight)",
        detection: "Turn 1 Exit (50m post apex)",
        activation: "Downhill descent towards Turn 2",
        length: "440 meters",
        topSpeed: "318.6 km/h",
        overtakeProb: "Medium (Switchback Counter-Attack Zone)"
      }
    ],
    brakingZones: [
      {
        turn: "Turn 1",
        entrySpeed: "340 km/h",
        apexSpeed: "102 km/h",
        gForce: "4.8G",
        brakingDist: "118 meters",
        gearShift: "8th ➔ 2nd"
      },
      {
        turn: "Turn 4",
        entrySpeed: "298 km/h",
        apexSpeed: "205 km/h",
        gForce: "3.9G",
        brakingDist: "65 meters",
        gearShift: "7th ➔ 4th"
      },
      {
        turn: "Turn 12",
        entrySpeed: "312 km/h",
        apexSpeed: "128 km/h",
        gForce: "4.2G",
        brakingDist: "98 meters",
        gearShift: "7th ➔ 3rd"
      }
    ]
  };

  const drsZonesList = circuitSpecs?.drsZones || [];
  const activeZone = drsZonesList.find(z => z.id === selectedZone) || drsZonesList[0] || {};

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
      
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Navigation color="var(--cyan-neon)" size={22} />
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
              Canonical FIA Circuit Blueprint & DRS Activation Radar
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {circuitName} • {locality}, {country}
          </p>
        </div>

        {/* Spec Pills */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block' }}>TRACK LENGTH</span>
            <span className="font-mono font-orbitron" style={{ color: '#FFF', fontWeight: 800, fontSize: '0.9rem' }}>{circuitSpecs.length}</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block' }}>RACE LAPS</span>
            <span className="font-mono font-orbitron" style={{ color: '#FFF', fontWeight: 800, fontSize: '0.9rem' }}>{circuitSpecs.laps}</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block' }}>RACE DISTANCE</span>
            <span className="font-mono font-orbitron" style={{ color: 'var(--cyan-neon)', fontWeight: 800, fontSize: '0.9rem' }}>{circuitSpecs.raceDistance}</span>
          </div>
        </div>
      </div>

      {/* SVG Canonical Circuit Layout Diagram */}
      <div style={{
        position: 'relative',
        height: '260px',
        background: 'radial-gradient(circle at center, rgba(39, 244, 210, 0.05) 0%, rgba(0,0,0,0.4) 100%)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        
        {/* SVG Track Vector */}
        <svg viewBox={circuitVectorMap.viewBox} style={{ width: '90%', height: '85%' }}>
          <defs>
            <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#27F4D2" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF1801" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          
          {/* Main Track Vector Line */}
          <path
            d={circuitVectorMap.path}
            fill="none"
            stroke="url(#trackGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* DRS Zone 1 Highlight */}
          {circuitVectorMap.drs1Path && (
            <path
              d={circuitVectorMap.drs1Path}
              fill="none"
              stroke="#27F4D2"
              strokeWidth="9"
              strokeDasharray="8,5"
              opacity={selectedZone === 'drs1' ? 1 : 0.4}
              onClick={() => setSelectedZone('drs1')}
              style={{ cursor: 'pointer' }}
            />
          )}

          {/* DRS Zone 2 Highlight */}
          {circuitVectorMap.drs2Path && (
            <path
              d={circuitVectorMap.drs2Path}
              fill="none"
              stroke="#FFB800"
              strokeWidth="9"
              strokeDasharray="8,5"
              opacity={selectedZone === 'drs2' ? 1 : 0.4}
              onClick={() => setSelectedZone('drs2')}
              style={{ cursor: 'pointer' }}
            />
          )}

          {/* Key Corner Pins & Turn Labels */}
          {circuitVectorMap.turns.map((turn) => (
            <g key={turn.id} transform={`translate(${turn.x}, ${turn.y})`}>
              <circle
                r="6"
                fill={turn.type === 'heavy_braking' ? '#FF1801' : turn.type === 'high_speed' ? '#27F4D2' : '#FFB800'}
                stroke="#FFF"
                strokeWidth="1.5"
              />
              <text
                x="8"
                y="4"
                fill="#FFF"
                fontSize="10"
                fontWeight="800"
                fontFamily="monospace"
                style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.9)' }}
              >
                {turn.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Live Lap Record Overlay */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-dim)' }}>CANONICAL LAP RECORD: </span>
          <span style={{ color: '#FFF', fontWeight: 700 }}>{circuitSpecs.lapRecord}</span>
        </div>
      </div>

      {/* DRS Zone Picker & Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* DRS Selector */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            SELECT DRS ACTIVATION ZONE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {circuitSpecs.drsZones.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '10px',
                  border: selectedZone === zone.id ? '1px solid var(--cyan-neon)' : '1px solid var(--border-subtle)',
                  background: selectedZone === zone.id ? 'rgba(39, 244, 210, 0.08)' : 'rgba(0,0,0,0.2)',
                  color: '#FFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-orbitron" style={{ fontSize: '0.88rem', fontWeight: 700 }}>{zone.name}</span>
                  <Zap size={14} color={selectedZone === zone.id ? 'var(--cyan-neon)' : 'var(--text-dim)'} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Length: {zone.length} • Max Speed: {zone.topSpeed}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected DRS Specs Box */}
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cyan-neon)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '8px' }}>
            {activeZone.name} DETAILS
          </div>
          <div style={{ fontSize: '0.85rem', color: '#FFF', lineHeight: '1.6' }}>
            <div><strong>Detection Point:</strong> {activeZone.detection}</div>
            <div><strong>Activation Line:</strong> {activeZone.activation}</div>
            <div><strong>Zone Length:</strong> {activeZone.length}</div>
            <div><strong>Est. DRS Top Speed:</strong> {activeZone.topSpeed}</div>
            <div style={{ marginTop: '6px', color: 'var(--gold-warning)', fontWeight: 700 }}>
              Overtake Probability: {activeZone.overtakeProb}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
