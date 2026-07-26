import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Shield, Zap, Flag, Activity } from 'lucide-react';

export default function CircuitBlueprintCard({ currentRace }) {
  const [selectedZone, setSelectedZone] = useState('drs1');

  const circuitName = currentRace?.Circuit?.circuitName || 'Hungaroring';
  const locality = currentRace?.Circuit?.Location?.locality || 'Budapest';
  const country = currentRace?.Circuit?.Location?.country || 'Hungary';

  const circuitSpecs = {
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
        length: "810 meters",
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
        apexSpeed: "215 km/h",
        gForce: "3.9G",
        brakingDist: "65 meters",
        gearShift: "7th ➔ 5th"
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

  const activeZone = circuitSpecs.drsZones.find(z => z.id === selectedZone) || circuitSpecs.drsZones[0];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
      
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Navigation color="var(--cyan-neon)" size={22} />
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', color: '#FFF' }}>
              Circuit Blueprint & DRS Activation Radar
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

      {/* SVG Circuit Layout Diagram */}
      <div style={{
        background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.05) 0%, rgba(10, 12, 18, 0.95) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <svg viewBox="0 0 600 300" style={{ maxWidth: '540px', width: '100%', height: 'auto', filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.3))' }}>
          {/* Track Outline Silhouette */}
          <path
            d="M 120 230 L 460 230 C 510 230 530 200 510 160 L 470 100 C 450 70 410 70 380 90 L 320 130 L 260 90 C 230 70 190 70 170 100 L 130 160 C 100 200 90 230 120 230 Z"
            fill="none"
            stroke="var(--cyan-neon)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Apex Line */}
          <path
            d="M 120 230 L 460 230 C 510 230 530 200 510 160 L 470 100 C 450 70 410 70 380 90 L 320 130 L 260 90 C 230 70 190 70 170 100 L 130 160 C 100 200 90 230 120 230 Z"
            fill="none"
            stroke="#FFF"
            strokeWidth="2"
            strokeDasharray="6,6"
          />
          
          {/* Turn Labels & DRS Indicators */}
          <g fill="#FFF" fontSize="12" fontFamily="Orbitron, sans-serif" fontWeight="bold">
            {/* Turn 1 */}
            <circle cx="480" cy="230" r="10" fill="#FF1801" />
            <text x="480" y="234" textAnchor="middle" fill="#FFF" fontSize="10">T1</text>
            
            {/* Turn 4 */}
            <circle cx="380" cy="90" r="10" fill="var(--cyan-neon)" />
            <text x="380" y="94" textAnchor="middle" fill="#000" fontSize="10">T4</text>
            
            {/* Turn 12 */}
            <circle cx="130" cy="160" r="10" fill="var(--gold-warning)" />
            <text x="130" y="164" textAnchor="middle" fill="#000" fontSize="10">T12</text>

            {/* Turn 14 */}
            <circle cx="120" cy="230" r="10" fill="#22C55E" />
            <text x="120" y="234" textAnchor="middle" fill="#000" fontSize="10">T14</text>

            {/* DRS Zone 1 Banner */}
            <rect x="250" y="245" width="120" height="22" rx="4" fill="rgba(0, 240, 255, 0.2)" stroke="var(--cyan-neon)" />
            <text x="310" y="260" textAnchor="middle" fill="var(--cyan-neon)" fontSize="10">DRS ZONE 1</text>
          </g>
        </svg>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
          Interactive Circuit Blueprint • Turn 1 (Heavy Braking) | Turn 4 (High Speed Entry) | Turn 14 (DRS Detection)
        </div>
      </div>

      {/* DRS Zones Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {circuitSpecs.drsZones.map((zone) => (
          <div
            key={zone.id}
            onClick={() => setSelectedZone(zone.id)}
            style={{
              background: selectedZone === zone.id ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.03)',
              border: selectedZone === zone.id ? '1px solid var(--cyan-neon)' : '1px solid var(--border-subtle)',
              padding: '16px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 800, color: '#FFF', fontSize: '0.9rem' }}>{zone.name}</div>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{zone.overtakeProb}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <div><strong>Detection</strong>: {zone.detection}</div>
              <div><strong>Activation</strong>: {zone.activation}</div>
              <div style={{ marginTop: '6px', color: 'var(--cyan-neon)', fontFamily: 'var(--font-mono)' }}>
                Length: {zone.length} • Max Speed: {zone.topSpeed}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Heavy Braking Zones Matrix */}
      <div>
        <h3 className="font-orbitron" style={{ fontSize: '1rem', color: '#FFF', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity color="var(--f1-red)" size={18} /> Heavy Deceleration & Braking Zones (High G-Force)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {circuitSpecs.brakingZones.map((b, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 24, 1, 0.04)',
              border: '1px solid rgba(255, 24, 1, 0.2)',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-orbitron" style={{ fontWeight: 800, color: '#FFF', fontSize: '0.95rem' }}>{b.turn}</span>
                <span className="badge badge-red font-mono" style={{ fontSize: '0.75rem', fontWeight: 800 }}>{b.gForce} DECEL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Entry Speed: <strong style={{ color: '#FFF' }}>{b.entrySpeed}</strong></span>
                <span>Apex: <strong style={{ color: 'var(--cyan-neon)' }}>{b.apexSpeed}</strong></span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Braking Distance: {b.brakingDist} • Shifts: {b.gearShift}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
