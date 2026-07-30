/**
 * JSON-RPC 2.0 网关通信类型
 * 从 @hermes/shared 中提取关键类型，适配 React Native
 */

// ── 连接状态 ──────────────────────────────────────────────
export type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

// ── JSON-RPC 消息 ─────────────────────────────────────────
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string;
  result?: unknown;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcEvent {
  jsonrpc: '2.0';
  id?: string;
  method: 'event';
  params: {
    type: GatewayEventName;
    session_id?: string;
    payload?: Record<string, unknown>;
  };
}

// ── 网关事件名称 ──────────────────────────────────────────
export type GatewayEventName =
  | 'gateway.ready'
  | 'session.info'
  | 'message.start'
  | 'message.delta'
  | 'message.interim'
  | 'message.complete'
  | 'thinking.delta'
  | 'reasoning.delta'
  | 'reasoning.available'
  | 'status.update'
  | 'tool.start'
  | 'tool.progress'
  | 'tool.complete'
  | 'tool.generating'
  | 'clarify.request'
  | 'approval.request'
  | 'sudo.request'
  | 'secret.request'
  | 'background.complete'
  | 'error'
  | 'skin.changed';

// ── 事件处理器 ────────────────────────────────────────────
export type GatewayEventHandler = (params: {
  type: GatewayEventName;
  session_id?: string;
  payload?: Record<string, unknown>;
}) => void;

// ── 皮肤 (Skin / Theme) ───────────────────────────────────
export interface HermesSkin {
  colors: SkinColors;
  dark_colors?: SkinColors;
  light_colors?: SkinColors;
  brand?: SkinBrand;
}

export interface SkinColors {
  background: string;
  ui_accent: string;
  ui_primary: string;
  ui_text: string;
  ui_border: string;
  ui_ok: string;
  ui_warn: string;
  ui_error: string;
  ui_tool: string;
  ui_thinking: string;
  diff_added: string;
  diff_removed: string;
}

export interface SkinBrand {
  name: string;
  icon?: string;
}

// ── 网关配置 ──────────────────────────────────────────────
export interface GatewayConfig {
  host: string;
  port: number;
  basePath?: string;
  useTls?: boolean;
  token?: string;
  /** 一次性 ticket (OAuth 模式) */
  ticket?: string;
}
