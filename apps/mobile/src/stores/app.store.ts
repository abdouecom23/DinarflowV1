import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const apiClient = axios.create({ baseURL: 'http://localhost:3000/api/v1' });

interface AppState {
  user: any | null;
  account: any | null;
  sessionId: string | null;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      account: null,
      sessionId: null,
      login: async (userId) => {
        const { data } = await apiClient.post('/auth/login', { userId });
        set({ user: data.user, sessionId: data.access_token });
        await get().refreshBalance();
      },
      logout: () => set({ user: null, account: null, sessionId: null }),
      refreshBalance: async () => {
        const { data } = await apiClient.get('/accounts/me', {
            headers: { Authorization: `Bearer ${get().sessionId}` }
        });
        set({ account: data });
      },
    }),
    { name: 'dinarflow-storage' }
  )
);
