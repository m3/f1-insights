import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SessionCountdownHeader from './components/SessionCountdownHeader';
import SessionClassificationTable from './components/SessionClassificationTable';
import BriefCard from './components/BriefCard';
import GridPenaltiesTracker from './components/GridPenaltiesTracker';
import PenaltyWatch from './components/PenaltyWatch';
import TeammateBattles from './components/TeammateBattles';
import StandingsView from './components/StandingsView';
import SocialSentiment from './components/SocialSentiment';
import WebhookDispatchModal from './components/WebhookDispatchModal';
import { useF1Store } from './store/useF1Store';

export default function App() {
  const { 
    data,
    error,
    fetchData,
    loading 
  } = useF1Store();

  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleWebhookModal = () => setWebhookModalOpen(!webhookModalOpen);

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

  const currentRace = data?.currentRace;
  const driverStandings = Array.isArray(data?.driverStandings) ? data.driverStandings : [];
  const constructorStandings = Array.isArray(data?.constructorStandings) ? data.constructorStandings : [];
  const penaltyPoints = Array.isArray(data?.penaltyWatch?.high_risk_drivers) ? data.penaltyWatch.high_risk_drivers : [];
  const teammateBattles = Array.isArray(data?.teammateBattles) ? data.teammateBattles : [];
  const preBrief = data?.latestPreBrief;
  const postBrief = data?.latestPostBrief;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px 40px' }}>
      <Header />
      
      {/* Session Countdown Header Bar */}
      <SessionCountdownHeader currentRace={currentRace} />

      <main>
        {activeTab === 'DASHBOARD' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', width: '100%', marginTop: '24px' }}>
            
            {/* COLUMN 1: The Strategy Desk (4 cols) */}
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '2px solid #FF1801', paddingBottom: '8px', marginBottom: '8px' }}>
                <h3 className="font-orbitron" style={{ margin: 0, fontSize: '1.2rem', color: '#FFF' }}>THE STRATEGY DESK</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Data-driven forecasting & tactical analysis</p>
              </div>
              <SessionClassificationTable data={data} currentRace={currentRace} />
              <GridPenaltiesTracker penaltiesData={data?.gridPenalties} />
              <TeammateBattles battles={teammateBattles} />
            </div>

            {/* COLUMN 2: AI Intelligence Briefings (4 cols) */}
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '2px solid var(--cyan-neon)', paddingBottom: '8px', marginBottom: '8px' }}>
                <h3 className="font-orbitron" style={{ margin: 0, fontSize: '1.2rem', color: '#FFF' }}>INTELLIGENCE BRIEFINGS</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI-synthesized narrative reports</p>
              </div>
              <BriefCard preBrief={preBrief} postBrief={postBrief} />
            </div>

            {/* COLUMN 3: The Paddock Radar (4 cols) */}
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '2px solid #C084FC', paddingBottom: '8px', marginBottom: '8px' }}>
                <h3 className="font-orbitron" style={{ margin: 0, fontSize: '1.2rem', color: '#FFF' }}>PADDOCK RADAR</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live news, drama, and regulatory scrutiny</p>
              </div>
              <PenaltyWatch penaltyPoints={penaltyPoints} />
              <SocialSentiment sentiment={data?.socialSentiment} />
              <StandingsView
                driverStandings={driverStandings}
                constructorStandings={constructorStandings}
                schedule={data?.schedule || []}
              />
            </div>

          </div>
        )}
      </main>

      <WebhookDispatchModal
        isOpen={webhookModalOpen}
        onClose={() => setWebhookModalOpen(false)}
        preBrief={preBrief}
        postBrief={postBrief}
      />
    </div>
  );
}
