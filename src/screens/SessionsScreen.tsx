/**
 * 会话列表屏幕
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSessionStore } from '../stores/sessionStore';
import { useChatStore } from '../stores/chatStore';
import { SessionItem } from '../components/SessionItem';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { getColors, resolveColorScheme, spacing, typography, borderRadius } from '../theme/colors';
import type { Session } from '../types';
import * as api from '../services/api';

interface SessionsScreenProps {
  navigation: any;
}

export const SessionsScreen: React.FC<SessionsScreenProps> = ({ navigation }) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);
  const searchQuery = useSessionStore((s) => s.searchQuery);
  const setSearchQuery = useSessionStore((s) => s.setSearchQuery);
  const sessions = useSessionStore((s) => s.sessions);
  const setSessions = useSessionStore((s) => s.setSessions);
  const loading = useSessionStore((s) => s.loading);
  const setLoading = useSessionStore((s) => s.setLoading);
  const selectedSessionId = useSessionStore((s) => s.selectedSessionId);
  const setSelectedSessionId = useSessionStore((s) => s.setSelectedSessionId);
  const removeSession = useSessionStore((s) => s.removeSession);
  const clearChat = useChatStore((s) => s.clearChat);
  const setCurrentSessionId = useChatStore((s) => s.setCurrentSessionId);
  const setMessages = useChatStore((s) => s.setMessages);

  // 加载会话列表
  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listSessions({ limit: 50 });
      setSessions(res.sessions);
    } catch (err) {
      console.warn('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // 搜索
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      loadSessions();
      return;
    }
    try {
      const res = await api.searchSessions(query);
      setSessions(res.sessions);
    } catch {
      // fallback: 本地过滤
      setSessions(
        sessions.filter((s) =>
          s.title.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    }
  }, [setSearchQuery, loadSessions, sessions, setSessions]);

  // 选中会话 — 加载消息并跳转到聊天
  const handleSessionPress = useCallback(async (session: Session) => {
    setSelectedSessionId(session.id);
    setCurrentSessionId(session.id);
    clearChat();

    try {
      const res = await api.getSessionMessages(session.id);
      setMessages(res.messages);
      navigation.navigate('Chat');
    } catch (err) {
      console.warn('Failed to load session messages:', err);
    }
  }, [setSelectedSessionId, setCurrentSessionId, clearChat, setMessages, navigation]);

  // 长按 — 操作菜单
  const handleSessionLongPress = useCallback((session: Session) => {
    Alert.alert(session.title || '对话', '选择操作', [
      {
        text: '重命名',
        onPress: () => {
          Alert.prompt?.('重命名', '输入新名称', async (newTitle) => {
            if (newTitle?.trim()) {
              try {
                await api.renameSession(session.id, newTitle.trim());
                loadSessions();
              } catch (err) {
                console.warn('Rename failed:', err);
              }
            }
          });
        },
      },
      {
        text: '归档',
        onPress: async () => {
          try {
            await api.setSessionArchived(session.id, !session.archived);
            loadSessions();
          } catch (err) {
            console.warn('Archive failed:', err);
          }
        },
      },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          Alert.alert('确认删除', '此操作不可撤销', [
            { text: '取消', style: 'cancel' },
            {
              text: '删除',
              style: 'destructive',
              onPress: async () => {
                try {
                  await api.deleteSession(session.id);
                  removeSession(session.id);
                } catch (err) {
                  console.warn('Delete failed:', err);
                }
              },
            },
          ]);
        },
      },
      { text: '取消', style: 'cancel' },
    ]);
  }, [loadSessions, removeSession]);

  const filteredSessions = searchQuery.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : sessions;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 顶部 */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>对话</Text>
        <ConnectionBadge compact />
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="搜索对话..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={[styles.clearButton, { color: colors.textTertiary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 会话列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionItem
              session={item}
              isSelected={item.id === selectedSessionId}
              onPress={handleSessionPress}
              onLongPress={handleSessionLongPress}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? '未找到匹配的对话' : '暂无对话'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerTitle: {
    ...typography.subtitle,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
  },
  clearButton: {
    fontSize: 16,
    paddingLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    ...typography.body,
  },
});
