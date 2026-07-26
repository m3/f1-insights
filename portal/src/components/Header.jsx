import React from 'react';
import { Flag, Zap, ShieldAlert, Award, Calendar, BarChart2, Gauge, Timer, AlertOctagon, Navigation, Sliders } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentRace }) {
  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 20px 20px', borderTop: 'none', padding: '16px 28px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Next Race Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF1801, #990000)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255,24,1,0.4)'
          }}>
            <Flag color="#FFF" size={24} />
          </div>
          <div>
            <h1 className="font-orbitron text-gradient-red" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '1px' }}>
              F1 INSIGHTS HQ
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Telemetry Analysis & Weekend Briefings • Powered by TracingInsights
            </p>
          </div>
        </div>

        {/* Next Weekend Pill */}
        {currentRace && (
          <div style={{
            background: 'rgba(255, 24, 1, 0.08)',
            border: '1px solid rgba(255, 24, 1, 0.3)',
            borderRadius: '12px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#FF1801',
              boxShadow: '0 0 10px #FF1801'
            }} className="animate-pulse-glow" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>UPCOMING GRAND PRIX</div>
              <div className="font-orbitron" style={{ fontSize: '0.9rem', color: '#FFF', fontWeight: 700 }}>
                {currentRace.raceName} • {currentRace.date}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Nav Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '16px',
        overflowX: 'auto'
      }}>
        <button
          className={`nav-tab ${activeTab === 'brief' ? 'active' : ''}`}
          onClick={() => setActiveTab('brief')}
        >
          <Zap size={16} /> Morning Brief
        </button>
        <button
          className={`nav-tab ${activeTab === 'circuit_blueprint' ? 'active' : ''}`}
          onClick={() => setActiveTab('circuit_blueprint')}
        >
          <Navigation size={16} /> Circuit Blueprint
        </button>
        <button
          className={`nav-tab ${activeTab === 'telemetry_overlay' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry_overlay')}
        >
          <Sliders size={16} /> Telemetry Overlay
        </button>
        <button
          className={`nav-tab ${activeTab === 'grid_penalties' ? 'active' : ''}`}
          onClick={() => setActiveTab('grid_penalties')}
        >
          <AlertOctagon size={16} /> Grid & Time Penalties
        </button>
        <button
          className={`nav-tab ${activeTab === 'sectors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sectors')}
        >
          <Gauge size={16} /> Sector Matrix
        </button>
        <button
          className={`nav-tab ${activeTab === 'pitstop' ? 'active' : ''}`}
          onClick={() => setActiveTab('pitstop')}
        >
          <Timer size={16} /> Pit Strategy
        </button>
        <button
          className={`nav-tab ${activeTab === 'penalties' ? 'active' : ''}`}
          onClick={() => setActiveTab('penalties')}
        >
          <ShieldAlert size={16} /> Licence Points
        </button>
        <button
          className={`nav-tab ${activeTab === 'teammates' ? 'active' : ''}`}
          onClick={() => setActiveTab('teammates')}
        >
          <Award size={16} /> Teammate Battles
        </button>
        <button
          className={`nav-tab ${activeTab === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          <Calendar size={16} /> Standings & Calendar
        </button>
      </div>
    </header>
  );
}
