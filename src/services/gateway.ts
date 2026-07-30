/**
 * Hermes Mobile — WebSocket 网关客户端
 * 适配自 apps/shared/src/json-rpc-gateway.ts 的 React Native 实现
 * 基于 JSON-RPC 2.0 协议与后端 tui_gateway 通信
 */

import type {
  ConnectionState,
  GatewayEventName,
  GatewayEventHandler,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcEvent,
} from '../types/gateway';

// ── 默认超时 ──────────────────────────────────────────────
const DEFAULT_REQUEST_TIMEOUT = 120_000; // 2 min
const DEFAULT_CONNECT_TIMEOUT = 15_000; // 15 sec

// ── 挂起的请求 ────────────────────────────────────────────
interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

// ── 网关客户端 ────────────────────────────────────────────
export class GatewayClient {
  private ws: WebSocket | null = null;
  private _connectionState: ConnectionState = 'idle';
  private requestIdCounter = 0;
  private pendingRequests = new Map<string, PendingRequest>();
  private eventHandlers = new Map<GatewayEventName, Set<GatewayEventHandler>>();
  private genericHandlers = new Set<GatewayEventHandler>();
  private connectTimer: ReturnType<typeof setTimeout> | null = null;

  // ── 连接管理 ──

  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  private setConnectionState(state: ConnectionState) {
    this._connectionState = state;
    this.onStateChange?.(state);
  }

  /** 连接状态变化回调 */
  onStateChange: ((state: ConnectionState) => void) | null = null;

  async connect(url: string): Promise<void> {
    if (this._connectionState === 'connecting' || this._connectionState === 'open') {
      return;
    }

    this.setConnectionState('connecting');

    return new Promise<void>((resolve, reject) => {
      this.connectTimer = setTimeout(() => {
        this.close();
        reject(new Error('WebSocket connection timeout'));
      }, DEFAULT_CONNECT_TIMEOUT);

      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        this.setConnectionState('error');
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }

      this.ws.onopen = () => {
        if (this.connectTimer) {
          clearTimeout(this.connectTimer);
          this.connectTimer = null;
        }
        this.setConnectionState('open');
        resolve();
      };

      this.ws.onclose = () => {
        if (this.connectTimer) {
          clearTimeout(this.connectTimer);
          this.connectTimer = null;
        }
        this.setConnectionState('closed');
        this.rejectAllPending(new Error('WebSocket closed'));
      };

      this.ws.onerror = (event) => {
        if (this.connectTimer) {
          clearTimeout(this.connectTimer);
          this.connectTimer = null;
        }
        this.setConnectionState('error');
        reject(new Error('WebSocket error'));
      };

      this.ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data as string);
          this.handleFrame(frame);
        } catch (err) {
          console.warn('Failed to parse WS message:', err);
        }
      };
    });
  }

  close(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.setConnectionState('closed');
  }

  // ── 请求/响应 ──

  async request<T>(method: string, params?: Record<string, unknown>, timeout?: number): Promise<T> {
    if (this._connectionState !== 'open') {
      throw new Error('Gateway is not connected');
    }

    const id = `r${++this.requestIdCounter}`;
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request "${method}" timed out`));
      }, timeout ?? DEFAULT_REQUEST_TIMEOUT);

      this.pendingRequests.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
        timer,
      });

      try {
        this.ws?.send(JSON.stringify(request));
      } catch (err) {
        this.pendingRequests.delete(id);
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  // ── 事件订阅 ──

  on(event: GatewayEventName, handler: GatewayEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /** 监听所有事件 */
  onAny(handler: GatewayEventHandler): () => void {
    this.genericHandlers.add(handler);
    return () => {
      this.genericHandlers.delete(handler);
    };
  }

  // ── 内部处理 ──

  private handleFrame(raw: Record<string, unknown>): void {
    // 事件推送 (服务端主动)
    if (raw.method === 'event' && raw.params) {
      const params = raw.params as {
        type: GatewayEventName;
        session_id?: string;
        payload?: Record<string, unknown>;
      };
      const { type, session_id, payload } = params;

      // 通知特定事件处理器
      const handlers = this.eventHandlers.get(type);
      if (handlers) {
        handlers.forEach((h) => h({ type, session_id, payload }));
      }

      // 通知通用处理器
      this.genericHandlers.forEach((h) => h({ type, session_id, payload }));
      return;
    }

    // 请求响应
    if (typeof raw.id === 'string' && raw.id) {
      const pending = this.pendingRequests.get(raw.id);
      if (!pending) return;

      clearTimeout(pending.timer);
      this.pendingRequests.delete(raw.id);

      if (raw.error) {
        const errMsg =
          typeof raw.error === 'object' && raw.error !== null
            ? String((raw.error as { message?: string }).message ?? '')
            : 'RPC error';
        pending.reject(new Error(errMsg));
      } else {
        pending.resolve(raw.result);
      }
    }
  }

  private rejectAllPending(error: Error): void {
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timer);
      pending.reject(error);
    });
    this.pendingRequests.clear();
  }
}
