/**
 * 连接状态指示器
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useConnectionStore } from '../stores/connectionStore';
import { getColors, spacing, typography } from '../theme/colors';
import type { ConnectionState } from '../types/gateway';

function getStatusColor(status: ConnectionState): string {
  switch (status) {
    case 'open':
      return '#34C759';
    case 'connecting':
      return '#FF9500';
    case 'error':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
}

function getStatusLabel(status: ConnectionState): string {
  switch (status) {
    case 'open':
      return '已连接';
    case 'connecting':
      return '连接中...';
    case 'error':
      return '连接失败';
    case 'closed':
      return '未连接';
    default:
      return '未连接';
  }
}

interface ConnectionBadgeProps {
  compact?: boolean;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ compact }) => {
  const status = useConnectionStore((s) => s.status);
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  if (compact) {
    return (
      <View style={[styles.dot, { backgroundColor: color }]} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...typography.caption,
    color: '#8E8E93',
  },
});
