// API Client for F1 Insights React Frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function fetchOverviewData() {
  try {
    const response = await fetch(`${API_BASE_URL}/overview`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.currentRace) {
        return data;
      }
    }
  } catch (error) {
    console.warn('API Endpoint unreachable, falling back to static /data/overview.json:', error);
  }

  // Fallback to static JSON file
  const fallbackRes = await fetch('/data/overview.json');
  return await fallbackRes.json();
}
