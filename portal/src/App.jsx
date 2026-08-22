import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WeekendTimelineTracker from './components/WeekendTimelineTracker';
import GridPenaltiesTracker from './components/GridPenaltiesTracker';
import PenaltyWatch from './components/PenaltyWatch';
import TeammateBattles from './components/TeammateBattles';
import StandingsView from './components/StandingsView';
import SocialSentiment from './components/SocialSentiment';
import SessionClassificationTable from './components/SessionClassificationTable';
import StrategicPositionIndex from './components/StrategicPositionIndex';
import TruePaceRank from './components/TruePaceRank';
import ForensicTelemetry from './components/ForensicTelemetry';
import { useF1Store } from './store/useF1Store';

export default function App() {
  const { 
    data,
    error,
    fetchData,
    loading 
  } = useF1Store();

  const [activeView, setActiveView] = useState('PRE_WEEKEND');
  const [hasInitializedView, setHasInitializedView] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data?.timeline?.macroState && !hasInitializedView) {
      setActiveView(data.timeline.macroState);
      setHasInitializedView(true);
    }
  }, [data, hasInitializedView]);

  if (error) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
          <h2 className="font-orbitron text-gradient-red" style={{ marginBottom: '12px' }}>INTELLIGENCE FEED DISCONNECTED</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !data || !data.currentRace) {
    return (
      <div className="min-h-screen bg-space-black text-white font-body flex items-center justify-center">
        <div style={{ textAlign: 'center' }}>
          <div className="glowing-spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px', border: '3px solid rgba(255, 24, 1, 0.2)', borderTopColor: '#FF1801', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 className="font-orbitron" style={{ color: '#FF1801', textTransform: 'uppercase', letterSpacing: '2px' }}>Establishing Uplink...</h2>
        </div>
      </div>
    );
  }

  const currentRace = data?.currentRace;
  const driverStandings = Array.isArray(data?.driverStandings) ? data.driverStandings : [];
  const constructorStandings = Array.isArray(data?.constructorStandings) ? data.constructorStandings : [];
  const penaltyPoints = Array.isArray(data?.penaltyWatch?.high_risk_drivers) ? data.penaltyWatch.high_risk_drivers : [];
  const teammateBattles = Array.isArray(data?.teammateBattles) ? data.teammateBattles : [];
  const sprintResults = Array.isArray(data?.sprintResults) ? data.sprintResults : [];
  const qualifyingResults = Array.isArray(data?.qualifyingResults) ? data.qualifyingResults : [];
  const sessionClassification = qualifyingResults.length > 0
    ? qualifyingResults
    : (sprintResults.length > 0 ? sprintResults : driverStandings);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px 40px' }}>
      <Header />
      
      <WeekendTimelineTracker 
        timeline={data?.timeline} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />

      <main>
        {activeView === 'PRE_WEEKEND' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <StandingsView driverStandings={driverStandings} constructorStandings={constructorStandings} schedule={data?.schedule || []} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <PenaltyWatch penaltyPoints={penaltyPoints} />
               <SocialSentiment sentiment={data?.socialSentiment} />
            </div>
          </div>
        )}

        {activeView === 'SESSION_IN_PROGRESS' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', width: '100%' }}>
             <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                 <h2 className="font-orbitron text-gradient-red">SESSION LIVE</h2>
                 <p style={{ color: 'var(--text-muted)' }}>Real-time telemetry ingestion active. Full analytical processing unlocks post-session.</p>
             </div>
          </div>
        )}

        {activeView === 'POST_SESSION' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <StrategicPositionIndex data={data} />
               <SessionClassificationTable data={{ ...data, driverStandings: sessionClassification }} currentRace={currentRace} />
               <GridPenaltiesTracker penaltiesData={data?.gridPenalties} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <TruePaceRank data={data} />
               <ForensicTelemetry data={data} />
               <TeammateBattles battles={teammateBattles} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
