/**
 * 模型配置屏幕
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
} from 'react-native';
import { useConfigStore } from '../stores/configStore';
import { getColors, resolveColorScheme, spacing, typography, borderRadius } from '../theme/colors';
import * as api from '../services/api';
import type { ModelOption } from '../types';

interface ModelConfigScreenProps {
  navigation: any;
}

export const ModelConfigScreen: React.FC<ModelConfigScreenProps> = ({ navigation }) => {
  const scheme = resolveColorScheme(useColorScheme());
  const colors = getColors(scheme);
  const selectedModel = useConfigStore((s) => s.selectedModel);
  const setSelectedModel = useConfigStore((s) => s.setSelectedModel);
  const modelOptions = useConfigStore((s) => s.modelOptions);
  const setModelOptions = useConfigStore((s) => s.setModelOptions);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadModels = async (refresh = false) => {
    try {
      const res = await api.getModelOptions(refresh);
      setModelOptions(res.models);
    } catch (err) {
      console.warn('Failed to load models:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleSelect = async (model: ModelOption) => {
    setSelectedModel(model);
    try {
      await api.setGlobalModel(model.provider, model.model);
      Alert.alert('成功', `已切换到 ${model.display_name}`);
    } catch (err) {
      Alert.alert('错误', '切换模型失败');
    }
  };

  // 按提供商分组
  const grouped = modelOptions.reduce<Record<string, ModelOption[]>>((acc, m) => {
    const key = m.provider || '其他';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const providers = Object.keys(grouped);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>模型选择</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); loadModels(true); }}>
          <Text style={[styles.refreshButton, { color: colors.primary }]}>刷新</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={providers}
        keyExtractor={(item) => item}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); loadModels(true); }}
        renderItem={({ item: provider }) => (
          <View style={styles.providerGroup}>
            <Text style={[styles.providerName, { color: colors.textSecondary }]}>
              {provider}
            </Text>
            {grouped[provider].map((model) => {
              const isSelected = selectedModel?.id === model.id;
              return (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelItem,
                    {
                      backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.borderLight,
                    },
                  ]}
                  onPress={() => handleSelect(model)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modelInfo}>
                    <Text style={[styles.modelName, { color: colors.text }]}>
                      {model.display_name}
                    </Text>
                    <Text style={[styles.modelId, { color: colors.textTertiary }]}>
                      {model.model}
                    </Text>
                    {model.description && (
                      <Text style={[styles.modelDesc, { color: colors.textSecondary }]}>
                        {model.description}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.radio, isSelected && { backgroundColor: colors.primary }]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  providerGroup: { marginBottom: spacing.xxl },
  providerName: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  modelInfo: { flex: 1 },
  modelName: { ...typography.bodyBold },
  modelId: { ...typography.small, marginTop: 2 },
  modelDesc: { ...typography.caption, marginTop: spacing.xs },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});
