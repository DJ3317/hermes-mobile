/**
 * 技能管理屏幕
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useConfigStore } from '../stores/configStore';
import { getColors, resolveColorScheme, spacing, typography, borderRadius } from '../theme/colors';
import * as api from '../services/api';
import type { Skill } from '../types';

interface SkillsScreenProps {
  navigation: any;
}

export const SkillsScreen: React.FC<SkillsScreenProps> = ({ navigation }) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);
  const skills = useConfigStore((s) => s.skills);
  const setSkills = useConfigStore((s) => s.setSkills);
  const toggleSkill = useConfigStore((s) => s.toggleSkill);
  const [loading, setLoading] = useState(true);

  const loadSkills = async () => {
    try {
      const res = await api.getSkills();
      setSkills(res.skills);
    } catch (err) {
      console.warn('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleToggle = async (skill: Skill) => {
    toggleSkill(skill.name);
    try {
      await api.toggleSkill(skill.name, !skill.enabled);
    } catch {
      toggleSkill(skill.name); // 回滚
    }
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>技能管理</Text>
        <TouchableOpacity onPress={loadSkills}>
          <Text style={[styles.refreshButton, { color: colors.primary }]}>刷新</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={skills}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={[styles.skillItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.skillInfo}>
              <Text style={[styles.skillName, { color: colors.text }]}>
                🧠 {item.name}
              </Text>
              {item.description && (
                <Text style={[styles.skillDesc, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              )}
              {item.version && (
                <Text style={[styles.skillVersion, { color: colors.textTertiary }]}>
                  v{item.version} · {item.source ?? '本地'}
                </Text>
              )}
            </View>
            <Switch
              value={item.enabled}
              onValueChange={() => handleToggle(item)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={item.enabled ? colors.primary : colors.textTertiary}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              暂无技能
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
  refreshButton: { ...typography.bodyBold },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: spacing.lg },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  skillInfo: { flex: 1, marginRight: spacing.md },
  skillName: { ...typography.bodyBold },
  skillDesc: { ...typography.caption, marginTop: spacing.xs },
  skillVersion: { ...typography.small, marginTop: spacing.xs },
  emptyContainer: { paddingVertical: spacing.xxxl * 2, alignItems: 'center' },
  emptyText: { ...typography.body },
});
