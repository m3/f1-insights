import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Globe, AlertCircle, CloudSun, Wind, Thermometer, Droplets } from 'lucide-react';
import { getWeekendPhase, getPhaseMetadata, getCircuitWeather } from '../utils/weekendPhase';

export default function SessionCountdownHeader({ currentRace }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [sessionName, setSessionName] = useState('RACE');
  const [localTimeStr, setLocalTimeStr] = useState('');

  const phase = getWeekendPhase(currentRace);
  const phaseMeta = getPhaseMetadata(phase);
  const circuitId = currentRace?.Circuit?.circuitId || 'default';
  const weather = getCircuitWeather(circuitId);

  useEffect(() => {
    if (!currentRace || !currentRace.date) return;

    // Calculate race target time
    const targetDate = new Date(`${currentRace.date}T${currentRace.time || '13:00:00Z'}`);

    // Format local timezone time
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formattedLocal = new Intl.DateTimeFormat('default', {
      timeZone: userTz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(targetDate);

    setLocalTimeStr(formattedLocal);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setSessionName('LIVE SESSION ACTIVE');
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRace]);

  if (!currentRace) return null;

  // Generate 1-Click .ics Calendar Download
  const downloadCalendarFile = () => {
    const startStr = `${currentRace.date.replace(/-/g, '')}T130000Z`;
    const endStr = `${currentRace.date.replace(/-/g, '')}T150000Z`;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//F1 Insights//Grand Prix Calendar//EN
BEGIN:VEVENT
SUMMARY:🏎️ ${currentRace.raceName} (F1 Insights)
DESCRIPTION:Formula 1 Grand Prix Session - ${currentRace.Circuit?.circuitName}
LOCATION:${currentRace.Circuit?.circuitName}, ${currentRace.Circuit?.Location?.country}
DTSTART:${startStr}
DTEND:${endStr}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${currentRace.raceName.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{
      padding: '20px 28px',
      marginBottom: '28px',
      background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.95), rgba(10, 12, 18, 0.98))',
      borderLeft: `4px solid ${phaseMeta.color}`
    }}>
      {/* Top Phase Badge Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge" style={{
            background: phaseMeta.color,
            color: '#000',
            fontWeight: 900,
            fontSize: '0.75rem',
            letterSpacing: '1px',
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            {phaseMeta.badge}
          </span>
          <div>
            <h2 className="font-orbitron" style={{ fontSize: '1rem', color: '#FFF', letterSpacing: '0.5px' }}>
              {phaseMeta.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {phaseMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Live Weather Forecast Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--gold-warning)' }}>
            <Thermometer size={14} /> <span>{weather.ambientTemp} Amb / {weather.trackTemp} Track</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--cyan-neon)' }}>
            <Droplets size={14} /> <span>{weather.rainRisk} Rain</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)' }}>
            <Wind size={14} /> <span>{weather.wind}</span>
          </div>
        </div>
      </div>

      {/* Bottom Countdown & Calendar Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Race Info & Local Time */}
        <div style={{ minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Globe size={16} color="var(--cyan-neon)" />
            <span className="font-orbitron" style={{ color: '#FFF', fontSize: '1.05rem', fontWeight: 800 }}>
              {currentRace.raceName}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Clock size={14} />
            <span>Your Local Time: <strong style={{ color: '#FFF' }}>{localTimeStr}</strong></span>
          </div>
        </div>

        {/* Digital Countdown Timer Boxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', minWidth: '60px' }}>
            <div className="font-mono font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFF' }}>
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>DAYS</div>
          </div>
          <span style={{ fontSize: '1.4rem', color: 'var(--text-dim)', fontWeight: 800 }}>:</span>
          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', minWidth: '60px' }}>
            <div className="font-mono font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFF' }}>
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>HRS</div>
          </div>
          <span style={{ fontSize: '1.4rem', color: 'var(--text-dim)', fontWeight: 800 }}>:</span>
          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', minWidth: '60px' }}>
            <div className="font-mono font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFF' }}>
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>MINS</div>
          </div>
          <span style={{ fontSize: '1.4rem', color: 'var(--text-dim)', fontWeight: 800 }}>:</span>
          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', minWidth: '60px' }}>
            <div className="font-mono font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--cyan-neon)' }}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>SECS</div>
          </div>
        </div>

        {/* 1-Click Calendar Download Button */}
        <button
          onClick={downloadCalendarFile}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            padding: '10px 18px',
            background: 'rgba(255, 24, 1, 0.12)',
            border: '1px solid rgba(255, 24, 1, 0.4)',
            color: '#FFF'
          }}
          title="Add Grand Prix session to Apple/Google/Outlook Calendar"
        >
          <Calendar size={16} color="#FF1801" /> Add to Calendar (.ics)
        </button>

      </div>
    </div>
  );
}
