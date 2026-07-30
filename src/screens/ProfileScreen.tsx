/**
 * Profile 管理屏幕
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useConfigStore } from '../stores/configStore';
import { getColors, resolveColorScheme, spacing, typography, borderRadius } from '../theme/colors';
import * as api from '../services/api';
import type { Profile } from '../types';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);
  const profiles = useConfigStore((s) => s.profiles);
  const setProfiles = useConfigStore((s) => s.setProfiles);
  const activeProfile = useConfigStore((s) => s.activeProfile);
  const setActiveProfile = useConfigStore((s) => s.setActiveProfile);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const loadProfiles = async () => {
    try {
      const res = await api.getProfiles();
      setProfiles(res.profiles);
      const active = res.profiles.find((p) => p.is_active);
      if (active) setActiveProfile(active);
    } catch (err) {
      console.warn('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newLabel.trim()) {
      Alert.alert('提示', '请填写名称和标签');
      return;
    }
    try {
      await api.createProfile(newName.trim(), newLabel.trim());
      setShowCreate(false);
      setNewName('');
      setNewLabel('');
      loadProfiles();
      Alert.alert('成功', `Profile "${newName}" 已创建`);
    } catch (err) {
      Alert.alert('错误', '创建失败');
    }
  };

  const handleDelete = (profile: Profile) => {
    if (profile.is_active) {
      Alert.alert('提示', '不能删除当前活跃的 Profile');
      return;
    }
    Alert.alert('确认删除', `删除 "${profile.label}"？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteProfile(profile.name);
            loadProfiles();
          } catch {
            Alert.alert('错误', '删除失败');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← 返回</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile 管理</Text>
        <TouchableOpacity onPress={() => setShowCreate(!showCreate)}>
          <Text style={[styles.addButton, { color: colors.primary }]}>
            {showCreate ? '取消' : '+ 新建'}
          </Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <View style={[styles.createForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="名称 (如: coding)"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.background }]}
          />
          <TextInput
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="显示标签 (如: 编程助手)"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, { color: colors.text, borderColor: colors.borderLight, backgroundColor: colors.background }]}
          />
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreate}
          >
            <Text style={styles.createButtonText}>创建</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
          const isActive = item.name === activeProfile?.name;
          return (
            <TouchableOpacity
              style={[
                styles.profileItem,
                {
                  backgroundColor: isActive ? colors.primaryLight : colors.surface,
                  borderColor: isActive ? colors.primary : colors.borderLight,
                },
              ]}
              onPress={() => setActiveProfile(item)}
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {item.label}
                </Text>
                <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                  @{item.name}
                </Text>
                {item.model && (
                  <Text style={[styles.profileMeta, { color: colors.textTertiary }]}>
                    🧠 {item.model}
                  </Text>
                )}
              </View>
              {isActive && (
                <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.activeBadgeText}>活跃</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              暂无 Profile
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: { ...typography.bodyBold },
  headerTitle: { ...typography.subtitle, fontWeight: '700' },
  addButton: { ...typography.bodyBold },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  createForm: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  createButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  createButtonText: { ...typography.bodyBold, color: '#FFFFFF' },
  listContent: { padding: spacing.lg },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  profileInfo: { flex: 1 },
  profileName: { ...typography.bodyBold },
  profileMeta: { ...typography.caption, marginTop: 2 },
  activeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  activeBadgeText: { ...typography.small, color: '#FFFFFF', fontWeight: '600' },
  emptyContainer: { paddingVertical: spacing.xxxl * 2, alignItems: 'center' },
  emptyText: { ...typography.body },
});
