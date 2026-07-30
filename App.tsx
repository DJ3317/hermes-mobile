/**
 * Hermes Mobile — 移动端 APP
 * 基于 NousResearch/hermes-agent 的移动端适配
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, LogBox, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useConnectionStore } from './src/stores/connectionStore';
import { useConfigStore } from './src/stores/configStore';
import type { ColorScheme } from './src/theme/colors';
import * as api from './src/services/api';

// 忽略特定 RN 警告
LogBox.ignoreLogs(['Reanimated', 'Non-serializable']);

/** 内部组件 — 使用 SafeAreaInsets 确保内容在状态栏下方 */
function AppContent() {
  const insets = useSafeAreaInsets();
  const rawScheme = useColorScheme();
  const systemScheme: ColorScheme = rawScheme === 'dark' ? 'dark' : 'light';
  const useSystemTheme = useConfigStore((s) => s.useSystemTheme);
  const storedScheme = useConfigStore((s) => s.colorScheme);
  const setColorScheme = useConfigStore((s) => s.setColorScheme);

  // 跟随系统主题
  useEffect(() => {
    if (useSystemTheme) {
      setColorScheme(systemScheme);
    }
  }, [systemScheme, useSystemTheme]);

  // 启动时尝试加载已保存的配置并测试连接
  useEffect(() => {
    (async () => {
      const cfg = await api.loadApiConfig();
      if (cfg) {
        try {
          const status = await api.getStatus();
          useConnectionStore.getState().setBackendReachable(true);
          useConnectionStore.getState().setVersion(status.version ?? null);
          useConnectionStore.getState().setStatus('open');
        } catch {
          // 连接测试失败 — 等待用户手动设置
        }
      }
    })();
  }, []);

  const effectiveScheme = useSystemTheme ? systemScheme : storedScheme;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <StatusBar
        barStyle={effectiveScheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent={false}
        backgroundColor="transparent"
      />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
