/**
 * Weekend Phase State Machine Utility for F1 Insights.
 * Computes the active race weekend phase (PRE_WEEKEND, PRACTICE, QUALIFYING, RACE_DAY, POST_RACE)
 * and supplies phase-specific circuit weather and telemetry spotlight data.
 */

export function getWeekendPhase(currentRace, now = new Date()) {
  if (!currentRace || !currentRace.date) return 'PRE_WEEKEND';

  const raceDate = new Date(`${currentRace.date}T14:00:00Z`);
  const diffHours = (raceDate - now) / (1000 * 60 * 60);

  if (diffHours > 72) {
    return 'PRE_WEEKEND'; // Mon - Thu (Setup, Weather, Upgrades, Penalty Watch)
  } else if (diffHours > 24) {
    return 'PRACTICE'; // Fri - Sat AM (FP Long Runs, Sector Matrix, Stint Deg)
  } else if (diffHours > 4) {
    return 'QUALIFYING'; // Sat PM (Pole Lap Telemetry, Speed Trap)
  } else if (diffHours > -6) {
    return 'RACE_DAY'; // Sun Race Time (Pit Strategy, Undercut Loss)
  } else {
    return 'POST_RACE'; // Sun Night - Mon (Executive Post-Race Debrief)
  }
}

export function getPhaseMetadata(phase) {
  const map = {
    PRE_WEEKEND: {
      title: 'PRE-RACE PREPARATION MODE',
      subtitle: 'Technical Upgrades, FIA Penalty Point Watch & Weather Radar',
      color: 'var(--cyan-neon)',
      badge: 'BUILD-UP'
    },
    PRACTICE: {
      title: 'FREE PRACTICE & RACE PACE ANALYSIS',
      subtitle: 'FP1-FP3 Sector Times, Long-Run Tyre Deg & Corner Telemetry',
      color: '#EAB308',
      badge: 'PRACTICE & STINTS'
    },
    QUALIFYING: {
      title: 'QUALIFYING & POLE POSITION BATTLE',
      subtitle: 'Q3 Telemetry Lap Overlay, Speed Traps & Starting Grid',
      color: '#A855F7',
      badge: 'POLE BATTLE'
    },
    RACE_DAY: {
      title: 'RACE DAY & PIT STRATEGY CALCULATOR',
      subtitle: 'Live Pit Loss Traversal, Safety Car Windows & Undercuts',
      color: '#FF1801',
      badge: 'RACE DAY'
    },
    POST_RACE: {
      title: 'POST-RACE EXECUTIVE DEBRIEF',
      subtitle: 'Clean Air Pace Champion, Fastest Pitstops & Points Update',
      color: '#22C55E',
      badge: 'POST-RACE DEBRIEF'
    }
  };

  return map[phase] || map.PRE_WEEKEND;
}

export function getCircuitWeather(circuitId) {
  const weatherMap = {
    hungaroring: { ambientTemp: '28°C', trackTemp: '42°C', rainRisk: '15%', wind: '11 km/h NE', humidity: '48%' },
    spa: { ambientTemp: '19°C', trackTemp: '24°C', rainRisk: '65%', wind: '18 km/h SW', humidity: '78%' },
    monza: { ambientTemp: '29°C', trackTemp: '44°C', rainRisk: '10%', wind: '8 km/h S', humidity: '42%' },
    silverstone: { ambientTemp: '21°C', trackTemp: '31°C', rainRisk: '40%', wind: '22 km/h W', humidity: '62%' },
    default: { ambientTemp: '25°C', trackTemp: '36°C', rainRisk: '20%', wind: '14 km/h E', humidity: '50%' }
  };

  return weatherMap[circuitId] || weatherMap.default;
}
