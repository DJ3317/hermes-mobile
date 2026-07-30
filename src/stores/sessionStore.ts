/**
 * 会话列表 Store
 */

import { create } from 'zustand';
import type { Session } from '../types';

interface SessionStore {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedSessionId: string | null;

  setSessions: (sessions: Session[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSessionId: (id: string | null) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  removeSession: (id: string) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedSessionId: null,

  setSessions: (sessions) => set({ sessions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedSessionId: (selectedSessionId) => set({ selectedSessionId }),

  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),

  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    })),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    })),

  clear: () =>
    set({ sessions: [], loading: false, error: null, searchQuery: '' }),
}));
