// API Client for F1 Insights React Frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function fetchJson(endpoint, fallbackFile) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(`API ${endpoint} unreachable, falling back to static ${fallbackFile}:`, error);
  }
  const fallbackRes = await fetch(fallbackFile);
  return await fallbackRes.json();
}

export async function fetchOverviewData() {
  return await fetchJson('/overview', '/data/overview.json');
}

export async function fetchTelemetryData() {
  return await fetchJson('/telemetry', '/data/telemetry.json');
}

export async function fetchStrategyData() {
  return await fetchJson('/strategy', '/data/strategy.json');
}

export async function fetchSocialData() {
  return await fetchJson('/social', '/data/social_feed.json');
}
