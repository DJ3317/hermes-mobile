/**
 * 会话列表项组件
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import type { Session } from '../types';
import { getColors, resolveColorScheme, spacing, typography, borderRadius } from '../theme/colors';

interface SessionItemProps {
  session: Session;
  isSelected?: boolean;
  onPress: (session: Session) => void;
  onLongPress?: (session: Session) => void;
}

export const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isSelected = false,
  onPress,
  onLongPress,
}) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);

  const messageCount = session.message_count ?? 0;
  const timeAgo = formatTimeAgo(session.updated_at);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
          borderLeftColor: isSelected ? colors.primary : 'transparent',
        },
      ]}
      onPress={() => onPress(session)}
      onLongPress={() => onLongPress?.(session)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {session.title || '新对话'}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {messageCount} 条消息
          </Text>
          <Text style={[styles.metaDot, { color: colors.textTertiary }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {timeAgo}
          </Text>
        </View>
      </View>
      {session.pinned && (
        <Text style={styles.pinIcon}>📌</Text>
      )}
    </TouchableOpacity>
  );
};

function formatTimeAgo(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.small,
  },
  metaDot: {
    ...typography.small,
  },
  pinIcon: {
    fontSize: 14,
    marginLeft: spacing.sm,
  },
});
