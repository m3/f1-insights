import React, { useState } from 'react';
import { HelpCircle, ChevronRight, Eye, Calculator, ChevronDown, ChevronUp, EyeOff } from 'lucide-react';

export default function InteractiveQuestionCard() {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const questionsList = [
    {
      id: "AI-01",
      question: "Is Verstappen faster because of fresher tyres or genuine car pace?",
      observation: "Verstappen lap times were 0.420s faster than Norris between Laps 30-38.",
      evidence: [
        "Tyre Compound & Stint Age: Verstappen (Hard, 8 Laps) vs Norris (Hard, 24 Laps)",
        "Tyre Degradation Delta: Norris stint lap pace decaying at +0.08s/lap",
        "Clear Air Gap: Verstappen clean air gap = 4.2s (No DRS traffic obstruction)",
        "Telemetry Speed Trap: Sector 1 speed trap equal (314 km/h vs 313.8 km/h)"
      ],
      interpretation: "Pace delta is predominantly driven by tyre age delta (16 laps younger compound) rather than aerodynamic or engine power advantage.",
      confidence: "HIGH",
      validationStatus: "Validated",
      blindSpots: ["Fuel mass delta unobserved (estimated equal stint fuel load)"]
    },
    {
      id: "AI-02",
      question: "Why did McLaren decide not to pit under the Virtual Safety Car?",
      observation: "McLaren stayed out during VSC on Lap 22 while Red Bull pitted.",
      evidence: [
        "Pit Window Safety: Box gap to Alonso was 18.2s (Free pit stop required 21.0s)",
        "Traffic Re-entry Forecast: Pitting would drop Norris into P6 behind DRS train",
        "Compound Availability: Only 1 set of used Soft tyres remaining"
      ],
      interpretation: "McLaren prioritized track position in clean air over discounted pit stop time loss, avoiding P6 traffic lockup.",
      confidence: "HIGH",
      validationStatus: "Validated",
      blindSpots: ["Live tyre temperature degradation state unobserved"]
    },
    {
      id: "AI-03",
      question: "Who is currently the hidden hero trapped in traffic?",
      observation: "Albon is P12 on track but ranking P6 in clear-air lap pace capability.",
      evidence: [
        "Track Position: P12 behind Magnussen (DRS train gap = 0.65s)",
        "Clear Air Lap Pace: 81.240s average on Laps 14-18 when gap exceeded 1.2s",
        "Position Delta: +6 positions clear-air capability rank delta"
      ],
      interpretation: "Albon possesses top-6 race pace capability but is constrained by straight-line defense from Magnussen.",
      confidence: "MODERATE",
      validationStatus: "Inferred",
      blindSpots: ["ERS battery deployment state unobserved during defense laps"]
    }
  ];

  const currentQ = questionsList[selectedQuestionIndex];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--cyan-neon)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <HelpCircle color="var(--cyan-neon)" size={22} />
        <div>
          <h3 className="font-orbitron" style={{ fontSize: '1.15rem', color: '#FFF', margin: 0 }}>
            Interactive AI Question Reasoner & Evidence Explorer
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Select a natural fan question to inspect direct evidence, calculations, and epistemic uncertainty.
          </div>
        </div>
      </div>

      {/* Question Selection Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {questionsList.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setSelectedQuestionIndex(idx)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: selectedQuestionIndex === idx ? '1px solid var(--cyan-neon)' : '1px solid var(--border-subtle)',
              background: selectedQuestionIndex === idx ? 'rgba(0, 229, 255, 0.12)' : 'rgba(0,0,0,0.3)',
              color: selectedQuestionIndex === idx ? '#FFF' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ color: 'var(--cyan-neon)' }}>{q.id}</span>
            {q.question.length > 35 ? `${q.question.substring(0, 35)}...` : q.question}
          </button>
        ))}
      </div>

      {/* Selected Question Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>
          ❓ {currentQ.question}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 176, 0, 0.15)', color: 'var(--gold-warning)' }}>
            🟡 {currentQ.validationStatus}
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--cyan-neon)' }}>
            CONFIDENCE: {currentQ.confidence}
          </span>
        </div>
      </div>

      {/* 4-Field Schema */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={12} color="var(--cyan-neon)" /> 1. Direct Observation
          </div>
          <div style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: 600 }}>
            {currentQ.observation}
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calculator size={12} color="var(--gold-warning)" /> 2. Empirical Evidence & Calculations
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {currentQ.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
          </ul>
        </div>

        <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--cyan-neon)', textTransform: 'uppercase', marginBottom: '4px' }}>
            💡 3. Evidence-Backed Explanation
          </div>
          <div style={{ color: '#FFF', fontSize: '0.85rem', lineHeight: 1.4 }}>
            {currentQ.interpretation}
          </div>
        </div>
      </div>

      {/* Blind Spots Drawer */}
      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <EyeOff size={12} />
          {showDetails ? 'Hide Data Blind Spots' : 'Show Data Blind Spots'}
          {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showDetails && (
          <div style={{ marginTop: '10px', background: 'rgba(255, 69, 58, 0.05)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255, 69, 58, 0.15)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF453A', marginBottom: '4px', textTransform: 'uppercase' }}>
              🙈 Known Data Blind Spots
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {currentQ.blindSpots.map((bs, i) => <li key={i}>{bs}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
