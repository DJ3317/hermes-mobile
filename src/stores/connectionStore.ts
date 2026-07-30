/**
 * 连接状态 Store
 */

import { create } from 'zustand';
import type { ConnectionState } from '../types/gateway';

interface ConnectionStateStore {
  /** 网关 WebSocket 连接状态 */
  status: ConnectionState;
  /** 后端 HTTP 服务是否可达 */
  backendReachable: boolean;
  /** 后端版本 (从 /api/status 获取) */
  version: string | null;
  /** 错误信息 */
  error: string | null;
  /** 上次连接时间 */
  lastConnected: Date | null;

  setStatus: (status: ConnectionState) => void;
  setBackendReachable: (reachable: boolean) => void;
  setVersion: (version: string | null) => void;
  setError: (error: string | null) => void;
  setLastConnected: (date: Date) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as ConnectionState,
  backendReachable: false,
  version: null as string | null,
  error: null as string | null,
  lastConnected: null as Date | null,
};

export const useConnectionStore = create<ConnectionStateStore>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setBackendReachable: (backendReachable) => set({ backendReachable }),
  setVersion: (version) => set({ version }),
  setError: (error) => set({ error }),
  setLastConnected: (lastConnected) => set({ lastConnected }),
  reset: () => set(initialState),
}));
