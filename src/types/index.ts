/**
 * Hermes Mobile — 核心类型定义
 * 从 hermes-agent 的桌面客户端类型中提取并适配移动端
 */

// ── 会话 (Session) ────────────────────────────────────────
export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  archived: boolean;
  pinned: boolean;
  profile?: string;
  model?: string;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
  offset: number;
  limit: number;
}

// ── 消息 (Message) ────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  token_count?: number;
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  status: 'running' | 'complete' | 'error';
}

export interface ToolResult {
  tool_call_id: string;
  output: string;
  error?: string;
}

// ── 流式事件 (Streaming Events) ──────────────────────────
export interface StreamEvent {
  type: StreamEventType;
  session_id: string;
  message_id?: string;
  content?: string;
  delta?: string;
  metadata?: Record<string, unknown>;
  tool_call?: ToolCall;
  error?: string;
}

export type StreamEventType =
  | 'message.start'
  | 'message.delta'
  | 'message.complete'
  | 'thinking.delta'
  | 'tool.start'
  | 'tool.progress'
  | 'tool.complete'
  | 'error'
  | 'status.update';

// ── 配置 (Configuration) ──────────────────────────────────
export interface HermesConfig {
  model?: ModelConfig;
  provider?: string;
  profile?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  tools_enabled?: boolean;
}

export interface ModelConfig {
  provider: string;
  model: string;
  display_name?: string;
}

export interface ModelOption {
  id: string;
  provider: string;
  model: string;
  display_name: string;
  description?: string;
}

// ── 提供商 (Provider) ─────────────────────────────────────
export interface Provider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'openrouter' | 'custom' | 'nous';
  configured: boolean;
  models: ModelOption[];
}

// ── 网关状态 (Gateway Status) ─────────────────────────────
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface GatewayStatus {
  status: ConnectionStatus;
  version?: string;
  uptime?: number;
  active_sessions?: number;
  error?: string;
}

// ── Profile (配置文件) ─────────────────────────────────────
export interface Profile {
  name: string;
  label: string;
  model?: string;
  provider?: string;
  soul?: string;
  is_active: boolean;
  created_at: string;
}

// ── 技能 (Skill) ──────────────────────────────────────────
export interface Skill {
  name: string;
  description: string;
  enabled: boolean;
  version?: string;
  source?: string;
}
