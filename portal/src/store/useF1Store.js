import { create } from 'zustand';
import { fetchOverviewData, fetchTelemetryData, fetchStrategyData, fetchSocialData } from '../services/api';

export const useF1Store = create((set, get) => ({
  data: null, // Core data
  loading: true,
  error: null,
  activeTab: 'brief',
  selectedDriver1: 'NOR',
  selectedDriver2: 'VER',
  isWebhookModalOpen: false,

  setActiveTab: async (tab) => {
    set({ activeTab: tab });
    const { data } = get();
    if (!data) return;

    // Lazy load telemetry data
    if (['brief', 'telemetry', 'sectors', 'telemetry_overlay', 'circuit_blueprint'].includes(tab) && !data.sectorMatrix) {
      const telemetry = await fetchTelemetryData();
      set({ data: { ...get().data, ...telemetry } });
    }
    
    // Lazy load strategy data
    if (['brief', 'tyre_deg', 'grid_penalties', 'pitstop', 'penalties'].includes(tab) && !data.tyreStrategy) {
      const strategy = await fetchStrategyData();
      set({ data: { ...get().data, ...strategy } });
    }
    
    // Lazy load social data
    if (['brief', 'social'].includes(tab) && !data.socialSentiment) {
      const social = await fetchSocialData();
      set({ data: { ...get().data, socialSentiment: social } });
    }
  },

  setSelectedDriver1: (driver) => set({ selectedDriver1: driver }),
  setSelectedDriver2: (driver) => set({ selectedDriver2: driver }),
  setIsWebhookModalOpen: (isOpen) => set({ isWebhookModalOpen: isOpen }),

  fetchData: async () => {
    set({ loading: true });
    try {
      const payload = await fetchOverviewData();
      set({ data: payload, loading: false, error: null });
      
      // trigger lazy loads for the default tab
      get().setActiveTab(get().activeTab);
    } catch (err) {
      console.error('Failed to fetch F1 overview data:', err);
      set({ loading: false, error: err.message || 'Failed to load telemetry data' });
    }
  }
}));
