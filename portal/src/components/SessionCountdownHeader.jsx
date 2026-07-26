import React, { useState, useEffect } from 'react';
import { Calendar, Flag, Clock, Sun, CloudRain, Wind, AlertCircle } from 'lucide-react';

export default function SessionCountdownHeader({ currentRace }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [sessionState, setSessionState] = useState('UPCOMING'); // 'UPCOMING', 'LIVE', 'COMPLETED'

  const raceName = currentRace?.raceName || 'Hungarian Grand Prix';
  const circuitName = currentRace?.Circuit?.circuitName || 'Hungaroring';
  const raceDateStr = currentRace?.date || '2026-07-26';
  const raceTimeStr = currentRace?.time || '13:00:00Z';

  useEffect(() => {
    const calculateTime = () => {
      try {
        const targetIso = `${raceDateStr}T${raceTimeStr}`;
        const raceTime = new Date(targetIso).getTime();
        const now = new Date().getTime();
        const diff = raceTime - now;

        // Race finished window (2.5 hours post-start)
        const raceFinishTime = raceTime + (2.5 * 60 * 60 * 1000);

        if (now >= raceTime && now <= raceFinishTime) {
          setSessionState('LIVE');
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else if (now > raceFinishTime) {
          setSessionState('COMPLETED');
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else if (diff > 0) {
          setSessionState('UPCOMING');
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ days, hours, minutes, seconds });
        }
      } catch (err) {
        console.error('Error parsing countdown date:', err);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [raceDateStr, raceTimeStr]);

  const padZero = (n) => String(n).padStart(2, '0');

  return (
    <div className="glass-panel glass-panel-glow" style={{ padding: '20px 24px', marginBottom: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Race Info & Session State Badge */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="font-orbitron" style={{ color: '#FF1801', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px' }}>
              GRAND PRIX WEEKEND
            </span>
            {sessionState === 'LIVE' && (
              <span style={{ background: '#FF1801', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, animation: 'pulse 1.5s infinite' }}>
                🔴 RACE LIVE
              </span>
            )}
            {sessionState === 'COMPLETED' && (
              <span style={{ background: 'rgba(39, 244, 210, 0.2)', border: '1px solid var(--cyan-neon)', color: 'var(--cyan-neon)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                🏁 SESSION COMPLETED
              </span>
            )}
          </div>
          <h1 className="font-orbitron text-gradient-red" style={{ fontSize: '1.6rem', margin: 0, fontWeight: 900 }}>
            {raceName}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {circuitName} • {raceDateStr}
          </p>
        </div>

        {/* Live Track Weather Bar */}
        <div style={{ display: 'flex', gap: '16px', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#FFF' }}>
            <Sun size={16} color="var(--gold-warning)" />
            <span>28°C Amb / 42°C Track</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#FFF' }}>
            <CloudRain size={16} color="var(--cyan-neon)" />
            <span>15% Rain</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#FFF' }}>
            <Wind size={16} color="var(--text-dim)" />
            <span>11 km/h NE</span>
          </div>
        </div>

        {/* Dynamic Countdown Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {sessionState === 'UPCOMING' ? (
            <>
              <div style={{ textAlign: 'center' }}>
                <span className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', display: 'block' }}>{padZero(timeLeft.days)}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>DAYS</span>
              </div>
              <span style={{ color: 'var(--f1-red)', fontWeight: 800 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', display: 'block' }}>{padZero(timeLeft.hours)}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>HRS</span>
              </div>
              <span style={{ color: 'var(--f1-red)', fontWeight: 800 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', display: 'block' }}>{padZero(timeLeft.minutes)}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>MINS</span>
              </div>
              <span style={{ color: 'var(--f1-red)', fontWeight: 800 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', display: 'block' }}>{padZero(timeLeft.seconds)}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>SECS</span>
              </div>
            </>
          ) : (
            <div className="font-orbitron" style={{ fontSize: '1.1rem', fontWeight: 800, color: sessionState === 'LIVE' ? '#FF1801' : 'var(--cyan-neon)' }}>
              {sessionState === 'LIVE' ? 'LIGHTS OUT & AWAY WE GO!' : 'OFFICIAL CLASSIFICATION FILED'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
