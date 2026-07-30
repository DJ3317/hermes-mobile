/**
 * 聊天 Store — 管理消息流和聊天状态
 */

import { create } from 'zustand';
import type { Message, StreamEvent } from '../types';

interface ChatStore {
  /** 当前会话 ID */
  currentSessionId: string | null;
  /** 消息列表 */
  messages: Message[];
  /** 流式输出的累积内容 */
  streamingContent: string | null;
  /** 是否正在接收流式响应 */
  isStreaming: boolean;
  /** 编辑框中的文本 */
  inputText: string;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;

  setCurrentSessionId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  appendToLastMessage: (delta: string) => void;
  setStreamingContent: (content: string | null) => void;
  setIsStreaming: (streaming: boolean) => void;
  setInputText: (text: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** 处理流式事件 */
  handleStreamEvent: (event: StreamEvent) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSessionId: null,
  messages: [],
  streamingContent: null,
  isStreaming: false,
  inputText: '',
  loading: false,
  error: null,

  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),
  setMessages: (messages) => set({ messages }),
  setStreamingContent: (streamingContent) => set({ streamingContent }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setInputText: (inputText) => set({ inputText }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  appendToLastMessage: (delta) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + delta };
      }
      return { messages: msgs };
    }),

  handleStreamEvent: (event) => {
    const state = get();
    switch (event.type) {
      case 'message.start':
        set({ isStreaming: true, streamingContent: '' });
        break;

      case 'message.delta':
        if (event.delta) {
          set((s) => ({
            streamingContent: (s.streamingContent ?? '') + event.delta!,
          }));
        }
        break;

      case 'message.complete':
        if (state.streamingContent) {
          set((s) => ({
            messages: [
              ...s.messages,
              {
                id: event.message_id ?? `msg-${Date.now()}`,
                session_id: event.session_id,
                role: 'assistant',
                content: s.streamingContent ?? '',
                created_at: new Date().toISOString(),
              },
            ],
            streamingContent: null,
            isStreaming: false,
          }));
        } else {
          set({ streamingContent: null, isStreaming: false });
        }
        break;

      case 'error':
        set({ error: event.error ?? 'Unknown error', isStreaming: false });
        break;

      case 'tool.start':
      case 'tool.progress':
      case 'tool.complete':
        // 工具调用事件 — 可在 UI 中展示
        break;

      case 'thinking.delta':
        // 思考过程 — 可选展示
        break;

      case 'status.update':
        // 状态更新 — 可选展示
        break;
    }
  },

  clearChat: () =>
    set({
      messages: [],
      streamingContent: null,
      isStreaming: false,
      inputText: '',
      error: null,
    }),
}));
