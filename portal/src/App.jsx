import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BriefCard from './components/BriefCard';
import TelemetryChart from './components/TelemetryChart';
import PenaltyWatch from './components/PenaltyWatch';
import TeammateBattles from './components/TeammateBattles';
import StandingsView from './components/StandingsView';
import SocialSentiment from './components/SocialSentiment';

export default function App() {
  const [activeTab, setActiveTab] = useState('brief');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/overview.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load overview.json:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,24,1,0.2)',
            borderTop: '4px solid #FF1801',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div className="font-orbitron" style={{ color: '#FFF', fontSize: '1.1rem' }}>
            LOADING TELEMETRY DATA...
          </div>
        </div>
      </div>
    );
  }

  const currentRace = data?.currentRace;
  const driverStandings = data?.driverStandings || [];
  const constructorStandings = data?.constructorStandings || [];
  const penaltyPoints = data?.penaltyPoints || [];
  const teammateBattles = data?.teammateBattles || [];
  const preBrief = data?.latestPreBrief;
  const postBrief = data?.latestPostBrief;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px 40px' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} currentRace={currentRace} />

      <main>
        {activeTab === 'brief' && (
          <>
            <BriefCard preBrief={preBrief} postBrief={postBrief} />
            <SocialSentiment sentiment={data?.socialSentiment} />
          </>
        )}
        {activeTab === 'telemetry' && <TelemetryChart telemetryData={data?.telemetryTraces} />}
        {activeTab === 'penalties' && <PenaltyWatch penaltyPoints={penaltyPoints} />}
        {activeTab === 'teammates' && <TeammateBattles battles={teammateBattles} />}
        {activeTab === 'standings' && (
          <StandingsView
            driverStandings={driverStandings}
            constructorStandings={constructorStandings}
            schedule={data?.schedule || []}
          />
        )}
      </main>

      <footer style={{
        marginTop: '40px',
        textAlign: 'center',
        padding: '20px',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <p>
          F1 Telemetry & Morning Brief Project • Data sourced from TracingInsights & Ergast API
        </p>
      </footer>
    </div>
  );
}
