import { create } from 'zustand';
import { fetchOverviewData } from '../services/api';

export const useF1Store = create((set, get) => ({
  data: null,
  loading: true,
  error: null,
  activeTab: 'brief',
  selectedDriver1: 'NOR',
  selectedDriver2: 'VER',
  isWebhookModalOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedDriver1: (driver) => set({ selectedDriver1: driver }),
  setSelectedDriver2: (driver) => set({ selectedDriver2: driver }),
  setIsWebhookModalOpen: (isOpen) => set({ isWebhookModalOpen: isOpen }),

  fetchData: async () => {
    set({ loading: true });
    try {
      const payload = await fetchOverviewData();
      set({ data: payload, loading: false, error: null });
    } catch (err) {
      console.error('Failed to fetch F1 overview data:', err);
      set({ loading: false, error: err.message || 'Failed to load telemetry data' });
    }
  }
}));
