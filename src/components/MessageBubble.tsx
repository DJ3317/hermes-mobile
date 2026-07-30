/**
 * 消息气泡组件
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import type { Message, ToolCall, ToolResult } from '../types';
import { getColors, resolveColorScheme, spacing, typography, borderRadius } from '../theme/colors';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {/* 角色标签 */}
      <Text style={[styles.roleLabel, { color: colors.textTertiary }]}>
        {isUser ? '你' : 'Hermes'}
      </Text>

      {/* 消息气泡 */}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.userBubble }
            : { backgroundColor: colors.assistantBubble },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isUser ? colors.userBubbleText : colors.assistantBubbleText },
          ]}
        >
          {message.content}
        </Text>
      </View>

      {/* 工具调用信息 */}
      {message.tool_calls && message.tool_calls.length > 0 && (
        <View style={[styles.toolContainer, { borderColor: colors.border }]}>
          {message.tool_calls.map((tc, i) => (
            <View key={tc.id ?? i} style={styles.toolRow}>
              <Text style={[styles.toolName, { color: colors.tool }]}>
                🔧 {tc.name}
              </Text>
              <Text style={[styles.toolStatus, { color: colors.textSecondary }]}>
                {tc.status === 'running' ? '运行中...' : tc.status === 'complete' ? '完成' : '错误'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 时间戳 */}
      <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
        {formatTime(message.created_at)}
      </Text>
    </View>
  );
};

/** 流式消息气泡 — 用于展示正在接收的流 */
interface StreamingBubbleProps {
  content: string;
}

export const StreamingBubble: React.FC<StreamingBubbleProps> = ({ content }) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);

  return (
    <View style={[styles.container, styles.assistantContainer]}>
      <Text style={[styles.roleLabel, { color: colors.textTertiary }]}>
        Hermes
      </Text>
      <View style={[styles.bubble, { backgroundColor: colors.assistantBubble }]}>
        <Text style={[styles.messageText, { color: colors.assistantBubbleText }]}>
          {content}
          <Text style={styles.cursor}>▊</Text>
        </Text>
      </View>
    </View>
  );
};

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;

    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  roleLabel: {
    ...typography.small,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  bubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  messageText: {
    ...typography.body,
  },
  cursor: {
    opacity: 0.5,
  },
  toolContainer: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolName: {
    ...typography.caption,
    fontWeight: '600',
  },
  toolStatus: {
    ...typography.small,
  },
  timestamp: {
    ...typography.small,
    marginTop: spacing.xs,
    marginHorizontal: spacing.xs,
  },
});
