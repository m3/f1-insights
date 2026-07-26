import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SessionCountdownHeader from './components/SessionCountdownHeader';
import BriefCard from './components/BriefCard';
import CircuitBlueprintCard from './components/CircuitBlueprintCard';
import TelemetryOverlayTool from './components/TelemetryOverlayTool';
import TyreDegSimulator from './components/TyreDegSimulator';
import GridPenaltiesTracker from './components/GridPenaltiesTracker';
import TelemetryChart from './components/TelemetryChart';
import SectorMatrix from './components/SectorMatrix';
import PitStrategyCalculator from './components/PitStrategyCalculator';
import PenaltyWatch from './components/PenaltyWatch';
import TeammateBattles from './components/TeammateBattles';
import StandingsView from './components/StandingsView';
import SocialSentiment from './components/SocialSentiment';
import WebhookDispatchModal from './components/WebhookDispatchModal';
import { fetchOverviewData } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('brief');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  useEffect(() => {
    fetchOverviewData()
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load overview data:', err);
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
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRace={currentRace}
        onOpenWebhooks={() => setIsWebhookModalOpen(true)}
      />
      
      {/* Session Countdown Header Bar */}
      <SessionCountdownHeader currentRace={currentRace} />

      <main>
        {activeTab === 'brief' && (
          <>
            <BriefCard preBrief={preBrief} postBrief={postBrief} />
            <CircuitBlueprintCard currentRace={currentRace} circuitSpecsData={data?.circuitSpecs} />
            <TelemetryOverlayTool telemetryData={data?.telemetryTraces} />
            <TyreDegSimulator />
            <div style={{ marginTop: '24px' }}>
              <GridPenaltiesTracker penaltiesData={data?.gridPenalties} />
            </div>
            <SocialSentiment sentiment={data?.socialSentiment} />
          </>
        )}
        {activeTab === 'circuit_blueprint' && <CircuitBlueprintCard currentRace={currentRace} circuitSpecsData={data?.circuitSpecs} />}
        {activeTab === 'telemetry_overlay' && <TelemetryOverlayTool telemetryData={data?.telemetryTraces} />}
        {activeTab === 'tyre_deg' && <TyreDegSimulator />}
        {activeTab === 'grid_penalties' && <GridPenaltiesTracker penaltiesData={data?.gridPenalties} />}
        {activeTab === 'telemetry' && <TelemetryChart telemetryData={data?.telemetryTraces} />}
        {activeTab === 'sectors' && <SectorMatrix sectorData={data?.sectorMatrix} />}
        {activeTab === 'pitstop' && <PitStrategyCalculator />}
        {activeTab === 'penalties' && <PenaltyWatch penaltyPoints={penaltyPoints} />}
        {activeTab === 'teammates' && <TeammateBattles battles={teammateBattles} />}
        {activeTab === 'standings' && (
          <StandingsView
            driverStandings={driverStandings}
            constructorStandings={constructorStandings}
          />
        )}
        {activeTab === 'social' && <SocialSentiment sentiment={data?.socialSentiment} />}
      </main>

      <WebhookDispatchModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        preBrief={preBrief}
        postBrief={postBrief}
      />
    </div>
  );
}
