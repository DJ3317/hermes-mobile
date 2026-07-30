/**
 * 聊天屏幕 — 核心对话界面
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useChatStore } from '../stores/chatStore';
import { useConnectionStore } from '../stores/connectionStore';
import { useSessionStore } from '../stores/sessionStore';
import { MessageBubble, StreamingBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { getColors, resolveColorScheme, spacing, typography } from '../theme/colors';
import type { Message } from '../types';

interface ChatScreenProps {
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);
  const flatListRef = useRef<FlatList>(null);

  const messages = useChatStore((s) => s.messages);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const currentSessionId = useChatStore((s) => s.currentSessionId);
  const setInputText = useChatStore((s) => s.setInputText);
  const addMessage = useChatStore((s) => s.addMessage);
  const handleStreamEvent = useChatStore((s) => s.handleStreamEvent);
  const clearChat = useChatStore((s) => s.clearChat);
  const setCurrentSessionId = useChatStore((s) => s.setCurrentSessionId);

  const connectionStatus = useConnectionStore((s) => s.status);
  const isConnected = connectionStatus === 'open';

  // 当新消息到达时自动滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0 || streamingContent) {
      scrollToBottom();
    }
  }, [messages.length, streamingContent, scrollToBottom]);

  // 发送消息
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || !isConnected) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      session_id: currentSessionId ?? `session-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    };

    addMessage(userMessage);

    // 设置当前 session ID (新对话时)
    if (!currentSessionId) {
      setCurrentSessionId(userMessage.session_id);
    }

    // 模拟发送到网关并接收流式响应
    // 实际应用中这里会调用 gateway.request('prompt.submit', ...)
    // 并通过网关事件处理流式响应
    simulateStreamingResponse(userMessage);
  }, [currentSessionId, isConnected, addMessage, setCurrentSessionId]);

  // ⚠️ 模拟流式响应 — 用于演示 UI；实际实现需通过 GatewayClient
  const simulateStreamingResponse = (userMsg: Message) => {
    const demoResponses = [
      '你好！我能帮你做些什么？',
      '我可以帮你回答问题、编写代码、分析数据等等。',
      '请随时告诉我你的需求！',
    ];

    let idx = 0;
    const fullText = demoResponses.join('\n\n');

    handleStreamEvent({
      type: 'message.start',
      session_id: userMsg.session_id,
    });

    const interval = setInterval(() => {
      if (idx < fullText.length) {
        const chunk = fullText.slice(idx, idx + 3);
        idx += 3;
        handleStreamEvent({
          type: 'message.delta',
          session_id: userMsg.session_id,
          message_id: `msg-${Date.now()}`,
          delta: chunk,
        });
      } else {
        clearInterval(interval);
        handleStreamEvent({
          type: 'message.complete',
          session_id: userMsg.session_id,
          message_id: `msg-resp-${Date.now()}`,
        });
      }
    }, 30);
  };

  // 渲染消息列表
  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Hermes Agent
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {isConnected ? '开始一段新对话吧' : '请先连接到后端服务'}
      </Text>
      {!isConnected && (
        <TouchableOpacity
          style={[styles.connectButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.connectButtonText}>前往设置连接</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const hasMessages = messages.length > 0 || streamingContent !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 顶部栏 */}
      <View style={[styles.header, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Hermes</Text>
          <ConnectionBadge compact />
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (currentSessionId && messages.length > 0) {
              Alert.alert('新对话', '确定开始新对话吗？当前对话将被保存。', [
                { text: '取消', style: 'cancel' },
                {
                  text: '确定',
                  onPress: () => {
                    clearChat();
                  },
                },
              ]);
            } else {
              clearChat();
            }
          }}
        >
          <Text style={[styles.headerButtonText, { color: colors.primary }]}>
            新对话
          </Text>
        </TouchableOpacity>
      </View>

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          streamingContent ? (
            <StreamingBubble content={streamingContent} />
          ) : null
        }
        contentContainerStyle={[
          styles.messageList,
          hasMessages ? {} : styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* 输入区 */}
      <MessageInput onSend={handleSend} disabled={!isConnected || isStreaming} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.subtitle,
    fontWeight: '700',
  },
  headerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerButtonText: {
    ...typography.bodyBold,
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyList: {
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  connectButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 20,
  },
  connectButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
