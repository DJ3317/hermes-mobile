/**
 * Hermes Mobile — REST API 客户端
 * 适配自 web/src/lib/api.ts 的移动端实现
 * 支持通过 HTTP 连接到后端 tui_gateway
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_HOST = 'hermes:host';
const STORAGE_KEY_TOKEN = 'hermes:token';

export interface ApiConfig {
  host: string;
  token?: string;
}

let _config: ApiConfig = { host: 'http://localhost:8081' };

/** 保存 API 配置到持久化存储 */
export async function saveApiConfig(config: ApiConfig): Promise<void> {
  _config = config;
  await AsyncStorage.setItem(STORAGE_KEY_HOST, config.host);
  if (config.token) {
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, config.token);
  }
}

/** 从持久化存储加载 API 配置 */
export async function loadApiConfig(): Promise<ApiConfig | null> {
  const host = await AsyncStorage.getItem(STORAGE_KEY_HOST);
  const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
  if (!host) return null;
  _config = { host, token: token ?? undefined };
  return _config;
}

/** 获取当前 API 配置 */
export function getApiConfig(): ApiConfig {
  return { ..._config };
}

// ── 基础 HTTP 请求 ────────────────────────────────────────
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  timeout?: number;
  profile?: string;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, timeout = 15000, profile } = options;
  const url = `${_config.host}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (_config.token) {
    headers['X-Hermes-Session-Token'] = _config.token;
  }

  if (profile) {
    headers['X-Profile'] = profile;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ApiError(response.status, errorText, path);
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout', path);
    }
    throw new ApiError(0, (error as Error).message, path);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public path: string,
  ) {
    super(`[${status}] ${message} (${path})`);
    this.name = 'ApiError';
  }
}

// ── API 端点 ──────────────────────────────────────────────

/** 获取网关状态 */
export async function getStatus() {
  return request<{
    status: string;
    version?: string;
    uptime?: number;
    active_sessions?: number;
  }>('/api/status');
}

/** 列出会话 */
export async function listSessions(params?: {
  limit?: number;
  offset?: number;
  archived?: boolean;
  order?: 'updated_at' | 'created_at';
}) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  if (params?.archived) qs.set('archived', 'true');
  if (params?.order) qs.set('order', params.order);
  const q = qs.toString();
  return request<{
    sessions: import('../types').Session[];
    total: number;
  }>(`/api/sessions${q ? `?${q}` : ''}`);
}

/** 搜索会话 */
export async function searchSessions(query: string) {
  return request<{ sessions: import('../types').Session[] }>(
    `/api/sessions/search?q=${encodeURIComponent(query)}`,
  );
}

/** 获取会话详情 */
export async function getSession(sessionId: string) {
  return request<import('../types').Session>(`/api/sessions/${sessionId}`);
}

/** 获取会话消息 */
export async function getSessionMessages(sessionId: string) {
  return request<{ messages: import('../types').Message[] }>(
    `/api/sessions/${sessionId}/messages`,
  );
}

/** 删除会话 */
export async function deleteSession(sessionId: string) {
  return request<void>(`/api/sessions/${sessionId}`, { method: 'DELETE' });
}

/** 重命名会话 */
export async function renameSession(sessionId: string, title: string) {
  return request<void>(`/api/sessions/${sessionId}`, {
    method: 'PATCH',
    body: { title },
  });
}

/** 设置会话归档状态 */
export async function setSessionArchived(sessionId: string, archived: boolean) {
  return request<void>(`/api/sessions/${sessionId}`, {
    method: 'PATCH',
    body: { archived },
  });
}

/** 获取配置 */
export async function getConfig() {
  return request<Record<string, unknown>>('/api/config');
}

/** 保存配置 */
export async function saveConfig(config: Record<string, unknown>) {
  return request<void>('/api/config', { method: 'POST', body: config });
}

/** 获取模型选项 */
export async function getModelOptions(refresh?: boolean) {
  const qs = refresh ? '?refresh=true' : '';
  return request<{ models: import('../types').ModelOption[] }>(
    `/api/model/options${qs}`,
  );
}

/** 设置全局模型 */
export async function setGlobalModel(provider: string, model: string) {
  return request<void>('/api/model/set', {
    method: 'POST',
    body: { scope: 'global', provider, model },
  });
}

/** 获取所有配置项 */
export async function getHermesConfig() {
  return request<import('../types').HermesConfig>('/api/config');
}

/** 获取提供商列表 */
export async function getProviders() {
  return request<{ providers: import('../types').Provider[] }>('/api/providers');
}

/** 获取技能列表 */
export async function getSkills() {
  return request<{ skills: import('../types').Skill[] }>('/api/skills');
}

/** 切换技能启用状态 */
export async function toggleSkill(name: string, enabled: boolean) {
  return request<void>('/api/skills/toggle', {
    method: 'PUT',
    body: { name, enabled },
  });
}

/** 获取 Profile 列表 */
export async function getProfiles() {
  return request<{ profiles: import('../types').Profile[] }>('/api/profiles');
}

/** 创建 Profile */
export async function createProfile(name: string, label: string) {
  return request<import('../types').Profile>('/api/profiles', {
    method: 'POST',
    body: { name, label },
  });
}

/** 删除 Profile */
export async function deleteProfile(name: string) {
  return request<void>(`/api/profiles/${name}`, { method: 'DELETE' });
}

/** 获取 OAuth 提供商列表 */
export async function getOAuthProviders() {
  return request<{ providers: Array<{ id: string; name: string }> }>(
    '/api/providers/oauth',
  );
}

/** 重启网关 */
export async function restartGateway() {
  return request<void>('/api/gateway/restart', { method: 'POST' });
}

/** 获取消息平台状态 */
export async function getMessagingPlatforms() {
  return request<{ platforms: Array<{ id: string; name: string; connected: boolean }> }>(
    '/api/messaging/platforms',
  );
}

/** 测试连接 */
export async function testConnection(config: ApiConfig): Promise<boolean> {
  try {
    const prev = _config;
    _config = config;
    const result = await request<{ status: string }>('/api/status', {
      timeout: 5000,
    });
    _config = prev;
    return result.status === 'ok' || result.status === 'running';
  } catch {
    return false;
  }
}

/** 构建 WebSocket URL */
export function buildWsUrl(): string {
  const baseUrl = _config.host.replace(/^http/, 'ws');
  const path = '/api/ws';
  const tokenParam = _config.token ? `?token=${encodeURIComponent(_config.token)}` : '';
  return `${baseUrl}${path}${tokenParam}`;
}

/** 构建 WS 认证参数 */
export async function buildWsAuthParam(): Promise<readonly [string, string]> {
  // 简单模式：直接使用 token
  if (_config.token) {
    return ['token', _config.token] as const;
  }
  // Ticket 模式：从 auth 端点获取一次性 ticket
  try {
    const result = await request<{ ticket: string }>('/api/auth/ws-ticket');
    return ['ticket', result.ticket] as const;
  } catch {
    return ['token', ''] as const;
  }
}
