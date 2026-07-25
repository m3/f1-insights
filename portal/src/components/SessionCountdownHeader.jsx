import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Download, Radio, MapPin, ChevronRight } from 'lucide-react';

export default function SessionCountdownHeader({ currentRace }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeSession, setActiveSession] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!currentRace) return;

    // Define or parse race weekend sessions
    const raceDateStr = currentRace.date || '2026-07-26';
    const raceTimeStr = currentRace.time || '14:00:00Z';
    const targetIsoStr = `${raceDateStr}T${raceTimeStr.replace('Z', '')}Z`;
    const raceTargetDate = new Date(targetIsoStr);

    // Fallback schedule array if not explicitly detailed in feed
    const sessions = [
      { name: 'Practice 1 (FP1)', offsetHours: -48 },
      { name: 'Practice 2 (FP2)', offsetHours: -44 },
      { name: 'Practice 3 (FP3)', offsetHours: -24 },
      { name: 'Qualifying', offsetHours: -20 },
      { name: 'Grand Prix Race', offsetHours: 0 }
    ].map(s => {
      const date = new Date(raceTargetDate.getTime() + s.offsetHours * 3600 * 1000);
      return { ...s, targetDate: date };
    });

    const timer = setInterval(() => {
      const now = new Date();
      
      // Find next upcoming session or current live session
      let nextSess = sessions.find(s => s.targetDate > now);
      if (!nextSess) {
        nextSess = sessions[sessions.length - 1]; // Default to Race
      }
      setActiveSession(nextSess);

      const diff = nextSess.targetDate.getTime() - now.getTime();

      if (diff <= 0 && diff > -7200000) { // Active within 2 hours
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else if (diff > 0) {
        setIsLive(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRace]);

  const downloadIcsCalendar = () => {
    if (!currentRace) return;
    const raceTitle = currentRace.raceName || 'Formula 1 Grand Prix';
    const location = `${currentRace.locality || 'Circuit'}, ${currentRace.country || 'Host Country'}`;
    const raceDateStr = (currentRace.date || '20260726').replace(/-/g, '');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//F1 Insights HQ//NONSGML v1.0//EN',
      'BEGIN:VEVENT',
      `SUMMARY:🏎️ ${raceTitle}`,
      `DESCRIPTION:F1 Insights Race Weekend & Telemetry Analysis`,
      `LOCATION:${location}`,
      `DTSTART:${raceDateStr}T130000Z`,
      `DTEND:${raceDateStr}T150000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${raceTitle.replace(/\s+/g, '_')}_2026.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentRace) return null;

  return (
    <div className="glass-panel" style={{
      borderRadius: '16px',
      padding: '20px 24px',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.9), rgba(10, 13, 18, 0.95))',
      border: '1px solid rgba(255, 24, 1, 0.25)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Left Info Column */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              background: isLive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 24, 1, 0.12)',
              color: isLive ? '#EF4444' : '#FF1801',
              border: `1px solid ${isLive ? '#EF4444' : 'rgba(255, 24, 1, 0.4)'}`,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '1px'
            }}>
              {isLive ? <Radio size={14} className="animate-pulse" /> : <Clock size={14} />}
              {isLive ? 'LIVE SESSION IN PROGRESS' : `NEXT: ${activeSession?.name || 'RACE'}`}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Round {currentRace.round || '12'} • Season {currentRace.season || '2026'}
            </span>
          </div>

          <h2 className="font-orbitron text-gradient-red" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0' }}>
            {currentRace.raceName}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="#FF1801" /> {currentRace.locality}, {currentRace.country}
            </span>
            <span>•</span>
            <span style={{ color: '#FFF', fontWeight: 600 }}>
              {currentRace.circuitName}
            </span>
          </div>
        </div>

        {/* Center Digital Countdown Blocks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          {[
            { label: 'DAYS', val: timeLeft.days },
            { label: 'HOURS', val: timeLeft.hours },
            { label: 'MINS', val: timeLeft.minutes },
            { label: 'SECS', val: timeLeft.seconds }
          ].map((item, idx) => (
            <React.Fragment key={item.label}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 14px',
                minWidth: '64px',
                textAlign: 'center',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <div className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FF1801', lineHeight: '1.2' }}>
                  {String(item.val).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
                  {item.label}
                </div>
              </div>
              {idx < 3 && <span style={{ fontSize: '1.2rem', color: 'rgba(255,24,1,0.5)', fontWeight: 900 }}>:</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Right Action Button */}
        <div>
          <button
            onClick={downloadIcsCalendar}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF1801, #B30000)',
              border: 'none',
              cursor: 'pointer',
              color: '#FFF',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(255, 24, 1, 0.35)',
              transition: 'transform 0.2s ease'
            }}
            title="Download Grand Prix Schedule (.ics)"
          >
            <Download size={16} /> Add to Calendar (.ics)
          </button>
        </div>

      </div>
    </div>
  );
}
